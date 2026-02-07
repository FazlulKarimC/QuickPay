/**
 * Wallet Service
 * Core business logic for wallet operations
 */

import db from '@repo/db/client';
import { TransactionType } from '@repo/db/client';
import type { Wallet, WalletTransaction, Prisma } from '@repo/db/client';
import { Errors } from '../api-error';

// Re-export types for convenience
export type { Wallet, WalletTransaction };

/**
 * Response format for wallet
 */
export interface WalletResponse {
    id: string;
    userId: number;
    balance: number;
    createdAt: string;
    updatedAt: string;
}

/**
 * Response format for wallet transactions
 */
export interface WalletTransactionResponse {
    id: string;
    type: TransactionType;
    amount: number;
    reference: string;
    description: string | null;
    createdAt: string;
}

/**
 * Options for querying transactions
 */
export interface TransactionQueryOptions {
    type?: TransactionType;
    limit?: number;
    starting_after?: string;
}

/**
 * Transform wallet model to API response
 */
function toWalletResponse(wallet: Wallet): WalletResponse {
    return {
        id: wallet.id,
        userId: wallet.userId,
        balance: wallet.balance,
        createdAt: wallet.createdAt.toISOString(),
        updatedAt: wallet.updatedAt.toISOString(),
    };
}

/**
 * Transform transaction model to API response
 */
function toTransactionResponse(tx: WalletTransaction): WalletTransactionResponse {
    return {
        id: tx.id,
        type: tx.type,
        amount: tx.amount,
        reference: tx.reference,
        description: tx.description,
        createdAt: tx.createdAt.toISOString(),
    };
}

/**
 * Get or create wallet for a user
 * Auto-creates wallet if it doesn't exist
 */
export async function getOrCreateWallet(userId: number): Promise<WalletResponse> {
    // Try to find existing wallet
    let wallet = await db.wallet.findUnique({
        where: { userId },
    });

    // Create if doesn't exist
    if (!wallet) {
        wallet = await db.wallet.create({
            data: { userId },
        });
        console.log(`[Wallet] Created new wallet for user ${userId}`);
    }

    return toWalletResponse(wallet);
}

/**
 * Credit wallet (add funds)
 * Used for: payment success, P2P received
 */
export async function creditWallet(
    userId: number,
    amount: number,
    reference: string,
    description?: string
): Promise<WalletResponse> {
    if (amount <= 0) {
        throw Errors.validationError({ amount: 'Amount must be positive' });
    }

    const wallet = await db.$transaction(async (tx: Prisma.TransactionClient) => {
        // Get or create wallet
        let wallet = await tx.wallet.findUnique({
            where: { userId },
        });

        if (!wallet) {
            wallet = await tx.wallet.create({
                data: { userId },
            });
        }

        // Create credit transaction
        await tx.walletTransaction.create({
            data: {
                walletId: wallet.id,
                type: 'credit',
                amount,
                reference,
                description,
            },
        });

        // Update balance
        const updated = await tx.wallet.update({
            where: { id: wallet.id },
            data: {
                balance: { increment: amount },
            },
        });

        return updated;
    });

    console.log(`[Wallet] Credited ${amount} paise to user ${userId} (ref: ${reference})`);
    return toWalletResponse(wallet);
}

/**
 * Debit wallet (remove funds)
 * Used for: refund, P2P sent
 * Throws error if insufficient balance
 */
export async function debitWallet(
    userId: number,
    amount: number,
    reference: string,
    description?: string
): Promise<WalletResponse> {
    if (amount <= 0) {
        throw Errors.validationError({ amount: 'Amount must be positive' });
    }

    const wallet = await db.$transaction(async (tx: Prisma.TransactionClient) => {
        // Get wallet
        const wallet = await tx.wallet.findUnique({
            where: { userId },
        });

        if (!wallet) {
            throw Errors.notFound('Wallet');
        }

        // Check balance
        if (wallet.balance < amount) {
            throw Errors.insufficientFunds(amount, wallet.balance);
        }

        // Create debit transaction
        await tx.walletTransaction.create({
            data: {
                walletId: wallet.id,
                type: 'debit',
                amount,
                reference,
                description,
            },
        });

        // Update balance
        const updated = await tx.wallet.update({
            where: { id: wallet.id },
            data: {
                balance: { decrement: amount },
            },
        });

        return updated;
    });

    console.log(`[Wallet] Debited ${amount} paise from user ${userId} (ref: ${reference})`);
    return toWalletResponse(wallet);
}

/**
 * Get current balance for a user
 */
export async function getBalance(userId: number): Promise<{ balance: number }> {
    const wallet = await db.wallet.findUnique({
        where: { userId },
    });

    return { balance: wallet?.balance ?? 0 };
}

/**
 * Get transaction history for a user with pagination
 */
export async function getTransactions(
    userId: number,
    options: TransactionQueryOptions = {}
): Promise<{ data: WalletTransactionResponse[]; hasMore: boolean }> {
    const { type, limit = 20, starting_after } = options;

    // Find wallet
    const wallet = await db.wallet.findUnique({
        where: { userId },
    });

    if (!wallet) {
        return { data: [], hasMore: false };
    }

    // Build where clause
    const where: Prisma.WalletTransactionWhereInput = {
        walletId: wallet.id,
    };

    if (type) {
        where.type = type;
    }

    // Cursor for pagination
    let cursor: Prisma.WalletTransactionWhereUniqueInput | undefined;
    if (starting_after) {
        cursor = { id: starting_after };
    }

    // Fetch limit + 1 to check for more
    const transactions = await db.walletTransaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit + 1,
        ...(cursor && {
            skip: 1,
            cursor,
        }),
    });

    const hasMore = transactions.length > limit;
    const data = transactions.slice(0, limit).map(toTransactionResponse);

    return { data, hasMore };
}

/**
 * Get wallet with recent transactions (for dashboard)
 */
export async function getWalletWithTransactions(
    userId: number,
    transactionLimit = 5
): Promise<{
    balance: number;
    recentTransactions: WalletTransactionResponse[];
}> {
    const wallet = await db.wallet.findUnique({
        where: { userId },
        include: {
            transactions: {
                orderBy: { createdAt: 'desc' },
                take: transactionLimit,
            },
        },
    });

    if (!wallet) {
        return {
            balance: 0,
            recentTransactions: [],
        };
    }

    return {
        balance: wallet.balance,
        recentTransactions: wallet.transactions.map(toTransactionResponse),
    };
}
