"use server"
import { getServerSession } from "next-auth";
import { authOptions } from "../auth";
import prisma from "@repo/db/client";

interface TransferResult {
  success?: boolean;
  message?: string;
}

export async function p2pTransfer(to: string, amount: number): Promise<TransferResult> {
  const session = await getServerSession(authOptions);
  const from = session?.user?.id;

  if (!from) {
    return {
      message: "Error while sending"
    }
  }

  // Validate amount - must be a positive finite number
  if (!Number.isFinite(amount) || amount <= 0) {
    return {
      message: "Invalid amount. Amount must be a positive number."
    }
  }

  const toUser = await prisma.user.findFirst({
    where: {
      number: to
    }
  });

  if (!toUser) {
    return {
      message: "User not found"
    }
  }

  // Prevent self-transfer
  if (Number(from) === toUser.id) {
    return {
      message: "Cannot transfer to yourself"
    }
  }

  try {
    await prisma.$transaction(async (tx) => {
      // Lock sender's wallet first (FOR UPDATE)
      await tx.$queryRaw`SELECT * FROM "Wallet" WHERE "userId" = ${Number(from)} FOR UPDATE`;

      // Lock recipient's wallet to prevent lost increments under concurrent transfers
      await tx.$queryRaw`SELECT * FROM "Wallet" WHERE "userId" = ${toUser.id} FOR UPDATE`;

      // Check sender's balance
      const fromWallet = await tx.wallet.findUnique({
        where: { userId: Number(from) },
      });

      if (!fromWallet) {
        throw new Error('WALLET_NOT_FOUND');
      }

      if (fromWallet.balance < amount) {
        throw new Error('INSUFFICIENT_FUNDS');
      }

      // Debit sender
      await tx.wallet.update({
        where: { userId: Number(from) },
        data: { balance: { decrement: amount } },
      });

      // Credit recipient
      await tx.wallet.update({
        where: { userId: toUser.id },
        data: { balance: { increment: amount } },
      });

      // Record the transfer in p2pTransfer table
      const p2pRecord = await tx.p2pTransfer.create({
        data: {
          fromUserId: Number(from),
          toUserId: toUser.id,
          amount,
          timestamp: new Date()
        }
      });

      // Create wallet transaction for sender (debit)
      await tx.walletTransaction.create({
        data: {
          walletId: fromWallet.id,
          type: 'debit',
          amount,
          reference: `p2p_${p2pRecord.id}`,
          description: `Sent to ${toUser.number}`
        }
      });

      // Get recipient wallet to create transaction
      const toWallet = await tx.wallet.findUnique({
        where: { userId: toUser.id }
      });

      if (toWallet) {
        // Create wallet transaction for recipient (credit)
        await tx.walletTransaction.create({
          data: {
            walletId: toWallet.id,
            type: 'credit',
            amount,
            reference: `p2p_${p2pRecord.id}`,
            description: `Received from ${session.user.id}`
          }
        });
      }
    });

    return {
      success: true,
      message: "Transfer successful"
    };
  } catch (error) {
    // Handle specific error cases
    if (error instanceof Error) {
      if (error.message === 'INSUFFICIENT_FUNDS') {
        return {
          message: "Insufficient funds"
        };
      }
      if (error.message === 'WALLET_NOT_FOUND') {
        return {
          message: "Wallet not found"
        };
      }
    }

    // Log unexpected errors for debugging
    console.error("[P2P Transfer] Transaction failed:", {
      from,
      to,
      amount,
      error: error instanceof Error ? error.message : String(error),
    });

    return {
      message: "Transfer failed. Please try again."
    };
  }
}