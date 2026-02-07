import { NextRequest, NextResponse } from 'next/server';
import db from '@repo/db/client';
import { PaymentStatus } from '@repo/db/client';

// Define TransactionClient type using typeof to avoid Prisma namespace issues on Vercel
type TransactionClient = Parameters<Parameters<typeof db.$transaction>[0]>[0];

interface ProcessRequest {
    paymentIntentId: string;
    amount: number;
    method: string;
    callbackUrl: string;
}

/**
 * POST /api/bank-simulator/process-sync
 * Synchronously process payment and update wallet
 * This is for development/testing - simulates instant bank confirmation  
 */
export async function POST(request: NextRequest) {
    try {
        const body: ProcessRequest = await request.json();
        const { paymentIntentId, amount } = body;

        console.log(`[Bank Simulator] Processing payment ${paymentIntentId} synchronously`);

        // Find the payment intent with user and wallet
        const paymentIntent = await db.paymentIntent.findUnique({
            where: { id: paymentIntentId },
            include: { user: { include: { wallet: true } } },
        });

        if (!paymentIntent) {
            return NextResponse.json(
                { error: 'Payment intent not found' },
                { status: 404 }
            );
        }

        // Only process if in 'created' status
        if (paymentIntent.status !== 'created') {
            return NextResponse.json({
                received: true,
                message: 'Payment already processed',
                status: paymentIntent.status,
            });
        }

        // Simulate 80% success rate
        const success = Math.random() < 0.8;
        const processedAt = new Date();

        if (success) {
            // Process successful payment in a transaction
            await db.$transaction(async (tx: TransactionClient) => {
                // Update payment intent
                await tx.paymentIntent.update({
                    where: { id: paymentIntentId },
                    data: {
                        status: 'succeeded' as PaymentStatus,
                        processedAt,
                        paymentMethod: 'card',
                        bankReference: `BANK-${Date.now().toString(36).toUpperCase()}`,
                    },
                });

                // Ensure userId exists before wallet operations
                if (!paymentIntent.userId) {
                    throw new Error('Payment intent must have a userId for wallet operations');
                }

                // Get or create wallet
                let wallet = paymentIntent.user?.wallet;
                if (!wallet) {
                    wallet = await tx.wallet.create({
                        data: { userId: paymentIntent.userId },
                    });
                    console.log(`[Bank Simulator] Created new wallet for user ${paymentIntent.userId}`);
                }

                // Create credit transaction
                await tx.walletTransaction.create({
                    data: {
                        walletId: wallet.id,
                        type: 'credit',
                        amount: paymentIntent.amount,
                        reference: paymentIntentId,
                        description: `Payment received - ${paymentIntentId}`,
                    },
                });

                // Update wallet balance
                await tx.wallet.update({
                    where: { id: wallet.id },
                    data: {
                        balance: {
                            increment: paymentIntent.amount,
                        },
                    },
                });

                console.log(`[Bank Simulator] Credited ${paymentIntent.amount} paise to wallet ${wallet.id}`);
            });

            return NextResponse.json({
                received: true,
                paymentIntentId,
                status: 'succeeded',
                message: 'Payment processed successfully',
            });
        } else {
            // Handle failure
            const failureReasons = [
                'Insufficient funds',
                'Card declined by issuer',
                'Transaction timeout',
            ];
            const failureReason = failureReasons[Math.floor(Math.random() * failureReasons.length)];

            await db.paymentIntent.update({
                where: { id: paymentIntentId },
                data: {
                    status: 'failed' as PaymentStatus,
                    processedAt,
                    failureReason,
                    paymentMethod: 'card',
                },
            });

            return NextResponse.json(
                {
                    received: true,
                    paymentIntentId,
                    status: 'failed',
                    message: failureReason,
                },
                { status: 400 }
            );
        }
    } catch (error) {
        console.error('[Bank Simulator] Error processing payment:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
