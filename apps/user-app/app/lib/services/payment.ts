/**
 * Payment Service
 * Core business logic for payment intent operations
 */

import db from '@repo/db/client';
import { PaymentStatus, PaymentMethod } from '@repo/db/client';
import type { PaymentIntent, Prisma } from '@repo/db/client';
import { Errors } from '../api-error';
import type { CreatePaymentIntentInput, ListPaymentIntentsQuery } from '../validations/payment';

// Re-export types for convenience
export type { PaymentIntent };

/**
 * Response format for payment intents (excludes sensitive data)
 */
export interface PaymentIntentResponse {
    id: string;
    amount: number;
    currency: string;
    status: PaymentStatus;
    clientSecret: string;
    paymentMethod: PaymentMethod | null;
    metadata: Prisma.JsonValue;
    failureReason: string | null;
    bankReference: string | null;
    createdAt: string;
    updatedAt: string;
    processedAt: string | null;
}

/**
 * Transform database model to API response
 */
function toResponse(pi: PaymentIntent): PaymentIntentResponse {
    return {
        id: pi.id,
        amount: pi.amount,
        currency: pi.currency,
        status: pi.status,
        clientSecret: pi.clientSecret,
        paymentMethod: pi.paymentMethod,
        metadata: pi.metadata,
        failureReason: pi.failureReason,
        bankReference: pi.bankReference,
        createdAt: pi.createdAt.toISOString(),
        updatedAt: pi.updatedAt.toISOString(),
        processedAt: pi.processedAt?.toISOString() ?? null,
    };
}

/**
 * Create a new payment intent
 */
export async function createPaymentIntent(
    merchantId: number,
    data: CreatePaymentIntentInput,
    idempotencyKey?: string
): Promise<PaymentIntentResponse> {
    const paymentIntent = await db.paymentIntent.create({
        data: {
            amount: data.amount,
            currency: data.currency || 'INR',
            metadata: (data.metadata ?? {}) as Prisma.InputJsonValue,
            merchantId,
            idempotencyKey,
            status: 'created',
        },
    });

    return toResponse(paymentIntent);
}

/**
 * Get a single payment intent by ID
 */
export async function getPaymentIntent(
    id: string,
    merchantId: number
): Promise<PaymentIntentResponse> {
    const paymentIntent = await db.paymentIntent.findFirst({
        where: {
            id,
            merchantId,
        },
    });

    if (!paymentIntent) {
        throw Errors.notFound('Payment intent');
    }

    return toResponse(paymentIntent);
}

/**
 * Get a single payment intent by ID (for public checkout)
 */
export async function getPaymentIntentById(
    id: string
): Promise<PaymentIntentResponse> {
    const paymentIntent = await db.paymentIntent.findUnique({
        where: { id },
        include: { merchant: true }, // Include merchant details for header
    });

    if (!paymentIntent) {
        throw Errors.notFound('Payment intent');
    }

    return {
        ...toResponse(paymentIntent),
        // @ts-ignore - Create a mapped type or extended interface if needed, but for now we inject merchant info
        merchant: {
            name: paymentIntent.merchant.name,
            logo: null // DB doesn't have logo yet
        }
    };
}

/**
 * List payment intents with filters and pagination
 */
export async function listPaymentIntents(
    merchantId: number,
    query: ListPaymentIntentsQuery
): Promise<{ data: PaymentIntentResponse[]; hasMore: boolean }> {
    const where: Prisma.PaymentIntentWhereInput = {
        merchantId,
    };

    // Apply status filter
    if (query.status) {
        where.status = query.status;
    }

    // Apply date filters
    if (query.created_gte || query.created_lte) {
        where.createdAt = {};
        if (query.created_gte) {
            where.createdAt.gte = query.created_gte;
        }
        if (query.created_lte) {
            where.createdAt.lte = query.created_lte;
        }
    }

    // Apply cursor-based pagination
    let cursor: Prisma.PaymentIntentWhereUniqueInput | undefined;
    if (query.starting_after) {
        cursor = { id: query.starting_after };
    }

    // Fetch limit + 1 to check for more
    const limit = query.limit ?? 10;
    const paymentIntents = await db.paymentIntent.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit + 1,
        ...(cursor && {
            skip: 1, // Skip the cursor
            cursor,
        }),
    });

    const hasMore = paymentIntents.length > limit;
    const data = paymentIntents.slice(0, limit).map(toResponse);

    return { data, hasMore };
}

/**
 * Confirm a payment intent
 * Transitions: created → processing
 * Sends request to bank simulator for async processing
 */
export async function confirmPayment(
    id: string,
    merchantId: number,
    paymentMethod: PaymentMethod
): Promise<PaymentIntentResponse> {
    // Get current payment intent
    const paymentIntent = await db.paymentIntent.findFirst({
        where: { id, merchantId },
    });

    if (!paymentIntent) {
        throw Errors.notFound('Payment intent');
    }

    // Validate status transition
    if (paymentIntent.status !== 'created') {
        throw Errors.invalidPaymentStatus(paymentIntent.status, ['created']);
    }

    // Update to processing
    const updated = await db.paymentIntent.update({
        where: { id },
        data: {
            status: 'processing',
            paymentMethod,
        },
    });

    // Send to bank simulator for async processing
    const bankSimulatorUrl = process.env.BANK_SIMULATOR_URL;
    const callbackUrl = `${process.env.NEXTAUTH_URL}/api/webhooks/bank`;

    if (bankSimulatorUrl) {
        try {
            console.log(`[Payment] Sending payment ${id} to bank simulator`);
            const response = await fetch(`${bankSimulatorUrl}/process`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    paymentIntentId: id,
                    amount: paymentIntent.amount,
                    method: paymentMethod,
                    callbackUrl,
                }),
            });

            if (response.ok) {
                const result = await response.json();
                console.log(`[Payment] Bank simulator acknowledged: ${JSON.stringify(result)}`);
            } else {
                console.error(`[Payment] Bank simulator error: ${response.status}`);
            }
        } catch (error) {
            // Log error but don't block the response
            console.error('[Payment] Failed to contact bank simulator:', error);
        }
    } else {
        console.warn('[Payment] BANK_SIMULATOR_URL not configured');
    }

    return toResponse(updated);
}

/**
 * Cancel a payment intent
 * Transitions: created → canceled
 */
export async function cancelPayment(
    id: string,
    merchantId: number
): Promise<PaymentIntentResponse> {
    // Get current payment intent
    const paymentIntent = await db.paymentIntent.findFirst({
        where: { id, merchantId },
    });

    if (!paymentIntent) {
        throw Errors.notFound('Payment intent');
    }

    // Validate status transition
    if (paymentIntent.status !== 'created') {
        throw Errors.invalidPaymentStatus(paymentIntent.status, ['created']);
    }

    // Update to canceled
    const updated = await db.paymentIntent.update({
        where: { id },
        data: {
            status: 'canceled',
        },
    });

    return toResponse(updated);
}

/**
 * Refund a payment intent
 * Transitions: succeeded → refunded
 * Creates a reverse wallet transaction
 */
export async function refundPayment(
    id: string,
    merchantId: number
): Promise<PaymentIntentResponse> {
    // Get current payment intent with user info
    const paymentIntent = await db.paymentIntent.findFirst({
        where: { id, merchantId },
        include: { user: { include: { wallet: true } } },
    });

    if (!paymentIntent) {
        throw Errors.notFound('Payment intent');
    }

    // Validate status transition
    if (paymentIntent.status !== 'succeeded') {
        throw Errors.invalidPaymentStatus(paymentIntent.status, ['succeeded']);
    }

    // Use transaction for atomicity
    const updated = await db.$transaction(async (tx) => {
        // Update payment intent status
        const refundedIntent = await tx.paymentIntent.update({
            where: { id },
            data: {
                status: 'refunded',
            },
        });

        // If there's a user with a wallet, debit the refund amount
        if (paymentIntent.user?.wallet) {
            // Create debit transaction for the refund
            await tx.walletTransaction.create({
                data: {
                    walletId: paymentIntent.user.wallet.id,
                    type: 'debit',
                    amount: paymentIntent.amount,
                    reference: paymentIntent.id,
                    description: `Refund for payment ${paymentIntent.id}`,
                },
            });

            // Update wallet balance
            await tx.wallet.update({
                where: { id: paymentIntent.user.wallet.id },
                data: {
                    balance: {
                        decrement: paymentIntent.amount,
                    },
                },
            });
        }

        return refundedIntent;
    });

    return toResponse(updated);
}
