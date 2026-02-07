/**
 * Bank Webhook Handler
 * Receives callbacks from bank simulator after payment processing
 */

import { NextRequest, NextResponse } from 'next/server';
import db from '@repo/db/client';
import { PaymentStatus } from '@repo/db/client';

// Define TransactionClient type using typeof to avoid Prisma namespace issues on Vercel
type TransactionClient = Parameters<Parameters<typeof db.$transaction>[0]>[0];

/**
 * Callback payload from bank simulator
 */
interface BankCallbackPayload {
    paymentIntentId: string;
    status: 'succeeded' | 'failed';
    processedAt: string;
    failureReason?: string;
    bankReference?: string;
}

/**
 * POST /api/webhooks/bank
 * Receive payment status updates from bank simulator
 */
export async function POST(request: NextRequest) {
    try {
        const payload: BankCallbackPayload = await request.json();

        console.log(`[Webhook] Received bank callback for payment ${payload.paymentIntentId}`);
        console.log(`  Status: ${payload.status}`);

        // Validate required fields
        if (!payload.paymentIntentId || !payload.status || !payload.processedAt) {
            console.error('[Webhook] Invalid payload - missing required fields');
            return NextResponse.json(
                { error: 'Invalid payload' },
                { status: 400 }
            );
        }

        // Find the payment intent
        const paymentIntent = await db.paymentIntent.findUnique({
            where: { id: payload.paymentIntentId },
            include: { user: { include: { wallet: true } } },
        });

        if (!paymentIntent) {
            console.error(`[Webhook] Payment intent not found: ${payload.paymentIntentId}`);
            return NextResponse.json(
                { error: 'Payment intent not found' },
                { status: 404 }
            );
        }

        // Only process if currently in 'processing' status
        if (paymentIntent.status !== 'processing') {
            console.warn(`[Webhook] Payment ${payload.paymentIntentId} not in processing state (current: ${paymentIntent.status})`);
            return NextResponse.json({
                received: true,
                message: 'Payment already processed',
            });
        }

        // Handle success
        if (payload.status === 'succeeded') {
            await handlePaymentSuccess(paymentIntent, payload);
        } else {
            // Handle failure
            await handlePaymentFailure(paymentIntent, payload);
        }

        console.log(`[Webhook] Successfully processed callback for ${payload.paymentIntentId}`);

        return NextResponse.json({
            received: true,
            paymentIntentId: payload.paymentIntentId,
            newStatus: payload.status,
        });
    } catch (error) {
        console.error('[Webhook] Error processing bank callback:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

/**
 * Handle successful payment
 * Updates payment status and credits user wallet
 */
async function handlePaymentSuccess(
    paymentIntent: {
        id: string;
        amount: number;
        user?: { id: number; wallet?: { id: string } | null } | null;
    },
    payload: BankCallbackPayload
) {
    await db.$transaction(async (tx: TransactionClient) => {
        // Update payment intent
        await tx.paymentIntent.update({
            where: { id: paymentIntent.id },
            data: {
                status: 'succeeded' as PaymentStatus,
                processedAt: new Date(payload.processedAt),
                bankReference: payload.bankReference,
            },
        });

        // Credit user's wallet if user exists
        if (paymentIntent.user?.wallet) {
            // Create credit transaction
            await tx.walletTransaction.create({
                data: {
                    walletId: paymentIntent.user.wallet.id,
                    type: 'credit',
                    amount: paymentIntent.amount,
                    reference: paymentIntent.id,
                    description: `Payment received - ${payload.bankReference || paymentIntent.id}`,
                },
            });

            // Update wallet balance
            await tx.wallet.update({
                where: { id: paymentIntent.user.wallet.id },
                data: {
                    balance: {
                        increment: paymentIntent.amount,
                    },
                },
            });

            console.log(`[Webhook] Credited ${paymentIntent.amount} paise to wallet ${paymentIntent.user.wallet.id}`);
        } else {
            console.log(`[Webhook] No user wallet to credit for payment ${paymentIntent.id}`);
        }
    });
}

/**
 * Handle failed payment
 * Updates payment status with failure reason
 */
async function handlePaymentFailure(
    paymentIntent: { id: string },
    payload: BankCallbackPayload
) {
    await db.paymentIntent.update({
        where: { id: paymentIntent.id },
        data: {
            status: 'failed' as PaymentStatus,
            processedAt: new Date(payload.processedAt),
            failureReason: payload.failureReason || 'Payment failed',
        },
    });
}
