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

// Timeout for bank simulator requests (in ms)
const BANK_SIMULATOR_TIMEOUT_MS = 10000;

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
 * Public checkout response (excludes clientSecret for security)
 */
export interface PublicPaymentIntentResponse {
    id: string;
    amount: number;
    currency: string;
    status: PaymentStatus;
    paymentMethod: PaymentMethod | null;
    metadata: Prisma.JsonValue;
    failureReason: string | null;
    createdAt: string;
    merchant: {
        name: string;
        logo: string | null;
    };
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
 * Create a new payment intent with idempotency support
 * If idempotencyKey is provided and a matching record exists, returns existing record
 */
export async function createPaymentIntent(
    merchantId: number,
    data: CreatePaymentIntentInput,
    idempotencyKey?: string
): Promise<PaymentIntentResponse> {
    // Check for existing payment intent with same idempotency key
    if (idempotencyKey) {
        const existing = await db.paymentIntent.findFirst({
            where: { merchantId, idempotencyKey },
        });
        if (existing) {
            return toResponse(existing);
        }
    }

    try {
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
    } catch (error) {
        // Handle unique constraint violation (race condition on idempotency key)
        if (
            error instanceof Error &&
            error.message.includes('Unique constraint')
        ) {
            const existing = await db.paymentIntent.findFirst({
                where: { merchantId, idempotencyKey },
            });
            if (existing) {
                return toResponse(existing);
            }
        }
        throw error;
    }
}

/**
 * Get a single payment intent by ID (authenticated - for merchant dashboard)
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
 * Get a single payment intent by clientSecret (for public checkout)
 * Requires clientSecret for authorization - prevents enumeration attacks
 */
export async function getPaymentIntentBySecret(
    clientSecret: string
): Promise<PublicPaymentIntentResponse> {
    const paymentIntent = await db.paymentIntent.findFirst({
        where: { clientSecret },
        include: { merchant: true },
    });

    if (!paymentIntent) {
        throw Errors.notFound('Payment intent');
    }

    return {
        id: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
        paymentMethod: paymentIntent.paymentMethod,
        metadata: paymentIntent.metadata,
        failureReason: paymentIntent.failureReason,
        createdAt: paymentIntent.createdAt.toISOString(),
        merchant: {
            name: paymentIntent.merchant.name ?? 'Unknown Merchant',
            logo: null, // DB doesn't have logo yet
        },
    };
}

/**
 * Get a single payment intent by ID (for public checkout - legacy)
 * Returns limited public data without clientSecret
 */
export async function getPaymentIntentById(
    id: string
): Promise<PublicPaymentIntentResponse> {
    const paymentIntent = await db.paymentIntent.findUnique({
        where: { id },
        include: { merchant: true },
    });

    if (!paymentIntent) {
        throw Errors.notFound('Payment intent');
    }

    return {
        id: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
        paymentMethod: paymentIntent.paymentMethod,
        metadata: paymentIntent.metadata,
        failureReason: paymentIntent.failureReason,
        createdAt: paymentIntent.createdAt.toISOString(),
        merchant: {
            name: paymentIntent.merchant.name ?? 'Unknown Merchant',
            logo: null,
        },
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
 * Confirm a payment intent (atomic operation)
 * Transitions: created → processing
 * Sends request to bank simulator for async processing
 */
export async function confirmPayment(
    id: string,
    merchantId: number,
    paymentMethod: PaymentMethod
): Promise<PaymentIntentResponse> {
    // Atomic conditional update - only succeeds if status is 'created'
    // This prevents race conditions where two requests try to confirm simultaneously
    const updated = await db.paymentIntent.updateMany({
        where: {
            id,
            merchantId,
            status: 'created', // Only update if still in 'created' state
        },
        data: {
            status: 'processing',
            paymentMethod,
        },
    });

    // Check if update succeeded
    if (updated.count === 0) {
        // Either not found or invalid status - fetch to determine which
        const existing = await db.paymentIntent.findFirst({
            where: { id, merchantId },
        });

        if (!existing) {
            throw Errors.notFound('Payment intent');
        }

        throw Errors.invalidPaymentStatus(existing.status, ['created']);
    }

    // Fetch the updated record
    const paymentIntent = await db.paymentIntent.findUnique({
        where: { id },
    });

    if (!paymentIntent) {
        throw Errors.notFound('Payment intent');
    }

    // Send to bank simulator for async processing with timeout
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3002';
    const bankSimulatorUrl = `${baseUrl}/api/bank-simulator/process`;
    const callbackUrl = `${baseUrl}/api/webhooks/bank`;

    try {
        console.log(`[Payment] Sending payment ${id} to bank simulator`);

        // Create abort controller for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(
            () => controller.abort(),
            BANK_SIMULATOR_TIMEOUT_MS
        );

        try {
            const response = await fetch(bankSimulatorUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    paymentIntentId: id,
                    amount: paymentIntent.amount,
                    method: paymentMethod,
                    callbackUrl,
                }),
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (response.ok) {
                const result = await response.json();
                console.log(
                    `[Payment] Bank simulator acknowledged: ${JSON.stringify(result)}`
                );
            } else {
                console.error(
                    `[Payment] Bank simulator error: ${response.status}`
                );
                // Mark payment as failed if bank simulator rejects
                await handleBankSimulatorFailure(id, `Bank simulator returned ${response.status}`);
            }
        } catch (fetchError) {
            clearTimeout(timeoutId);
            throw fetchError;
        }
    } catch (error) {
        // Handle timeout or network errors
        const errorMessage =
            error instanceof Error && error.name === 'AbortError'
                ? 'Bank simulator request timed out'
                : `Failed to contact bank simulator: ${error}`;

        console.error(`[Payment] ${errorMessage}`);

        // Mark payment as failed on timeout/error so it doesn't stay stuck
        await handleBankSimulatorFailure(id, errorMessage);
    }

    return toResponse(paymentIntent);
}

/**
 * Handle bank simulator failure by marking payment as failed
 */
async function handleBankSimulatorFailure(
    id: string,
    reason: string
): Promise<void> {
    try {
        await db.paymentIntent.update({
            where: { id },
            data: {
                status: 'failed',
                failureReason: reason,
            },
        });
        console.log(`[Payment] Marked payment ${id} as failed: ${reason}`);
    } catch (updateError) {
        console.error(
            `[Payment] Failed to update payment status: ${updateError}`
        );
    }
}

/**
 * Cancel a payment intent (atomic operation)
 * Transitions: created → canceled
 */
export async function cancelPayment(
    id: string,
    merchantId: number
): Promise<PaymentIntentResponse> {
    // Atomic conditional update - only succeeds if status is 'created'
    const updated = await db.paymentIntent.updateMany({
        where: {
            id,
            merchantId,
            status: 'created', // Only cancel if still in 'created' state
        },
        data: {
            status: 'canceled',
        },
    });

    // Check if update succeeded
    if (updated.count === 0) {
        // Either not found or invalid status - fetch to determine which
        const existing = await db.paymentIntent.findFirst({
            where: { id, merchantId },
        });

        if (!existing) {
            throw Errors.notFound('Payment intent');
        }

        throw Errors.invalidPaymentStatus(existing.status, ['created']);
    }

    // Fetch the updated record
    const paymentIntent = await db.paymentIntent.findUnique({
        where: { id },
    });

    if (!paymentIntent) {
        throw Errors.notFound('Payment intent');
    }

    return toResponse(paymentIntent);
}

/**
 * Refund a payment intent (atomic operation with balance check)
 * Transitions: succeeded → refunded
 * Creates a reverse wallet transaction with balance validation
 */
export async function refundPayment(
    id: string,
    merchantId: number
): Promise<PaymentIntentResponse> {
    // Use transaction for atomicity - includes status check inside transaction
    const updated = await db.$transaction(async (tx) => {
        // Re-fetch inside transaction to prevent race conditions
        const paymentIntent = await tx.paymentIntent.findFirst({
            where: { id, merchantId },
            include: { user: { include: { wallet: true } } },
        });

        if (!paymentIntent) {
            throw Errors.notFound('Payment intent');
        }

        // Validate status transition inside transaction
        if (paymentIntent.status !== 'succeeded') {
            throw Errors.invalidPaymentStatus(paymentIntent.status, [
                'succeeded',
            ]);
        }

        // Update payment intent status atomically
        const refundedIntent = await tx.paymentIntent.update({
            where: { id },
            data: {
                status: 'refunded',
            },
        });

        // If there's a user with a wallet, debit the refund amount with balance check
        if (paymentIntent.user?.wallet) {
            const wallet = paymentIntent.user.wallet;

            // Check sufficient balance before decrementing
            if (wallet.balance < paymentIntent.amount) {
                throw Errors.insufficientFunds(
                    paymentIntent.amount,
                    wallet.balance
                );
            }

            // Create debit transaction for the refund
            await tx.walletTransaction.create({
                data: {
                    walletId: wallet.id,
                    type: 'debit',
                    amount: paymentIntent.amount,
                    reference: paymentIntent.id,
                    description: `Refund for payment ${paymentIntent.id}`,
                },
            });

            // Update wallet balance with conditional check (belt and suspenders)
            const updateResult = await tx.wallet.updateMany({
                where: {
                    id: wallet.id,
                    balance: { gte: paymentIntent.amount }, // Only update if sufficient balance
                },
                data: {
                    balance: {
                        decrement: paymentIntent.amount,
                    },
                },
            });

            if (updateResult.count === 0) {
                throw Errors.insufficientFunds(
                    paymentIntent.amount,
                    0 // Balance insufficient or changed during transaction
                );
            }
        }

        return refundedIntent;
    });

    return toResponse(updated);
}
