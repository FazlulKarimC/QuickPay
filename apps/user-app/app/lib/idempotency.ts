/**
 * Idempotency Key Handling
 * Prevents duplicate payment creation by tracking idempotency keys
 */

import db from '@repo/db/client';
import type { PaymentIntent } from '@repo/db/client';

// UUID v4 regex pattern for validation
const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export interface IdempotencyResult {
    exists: boolean;
    paymentIntent?: PaymentIntent;
}

/**
 * Parse idempotency key from request headers
 * @returns The idempotency key or null if not provided
 */
export function parseIdempotencyKey(request: Request): string | null {
    const key = request.headers.get('Idempotency-Key');
    return key?.trim() || null;
}

/**
 * Validate that a string is a valid UUID v4
 */
export function isValidUUID(key: string): boolean {
    return UUID_V4_REGEX.test(key);
}

/**
 * Check if a payment intent with the given idempotency key already exists
 * @returns Object indicating if the key exists and the existing payment intent if found
 */
export async function checkIdempotency(
    idempotencyKey: string,
    merchantId: number
): Promise<IdempotencyResult> {
    try {
        const existingPaymentIntent = await db.paymentIntent.findFirst({
            where: {
                idempotencyKey,
                merchantId,
            },
        });

        if (existingPaymentIntent) {
            return {
                exists: true,
                paymentIntent: existingPaymentIntent,
            };
        }

        return { exists: false };
    } catch (error) {
        console.error('Idempotency check failed:', error);
        // On error, assume no existing key (will fail on insert if duplicate)
        return { exists: false };
    }
}

/**
 * Response helper to return cached payment intent
 * When an idempotent request is repeated, return the original response
 */
export function createIdempotentResponse(paymentIntent: PaymentIntent): Response {
    return Response.json(
        {
            id: paymentIntent.id,
            clientSecret: paymentIntent.clientSecret,
            amount: paymentIntent.amount,
            currency: paymentIntent.currency,
            status: paymentIntent.status,
            createdAt: paymentIntent.createdAt.toISOString(),
            cached: true, // Indicate this is a cached response
        },
        {
            status: 200,
            headers: {
                'Idempotency-Replayed': 'true',
            },
        }
    );
}
