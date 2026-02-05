/**
 * Payment Intent Validation Schemas
 * Zod schemas for request validation
 */

import { z } from 'zod';

/**
 * Schema for creating a payment intent
 */
export const CreatePaymentIntentSchema = z.object({
    amount: z
        .number()
        .int('Amount must be an integer (in paise)')
        .positive('Amount must be positive')
        .min(100, 'Minimum amount is INR 1 (100 paise)'),
    currency: z
        .string()
        .toUpperCase()
        .default('INR')
        .refine((val) => val === 'INR', {
            message: 'Only INR currency is supported',
        }),
    metadata: z.record(z.string(), z.unknown()).optional(),
});

export type CreatePaymentIntentInput = z.infer<typeof CreatePaymentIntentSchema>;

/**
 * Schema for confirming a payment
 */
export const ConfirmPaymentSchema = z.object({
    paymentMethod: z.enum(['card', 'upi', 'netbanking']),
});

export type ConfirmPaymentInput = z.infer<typeof ConfirmPaymentSchema>;

/**
 * Schema for listing payment intents query parameters
 */
export const ListPaymentIntentsQuerySchema = z.object({
    status: z.enum(['created', 'processing', 'succeeded', 'failed', 'canceled', 'refunded']).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
    starting_after: z.string().optional(),
    created_gte: z.string().optional().transform((val) => (val ? new Date(val) : undefined)),
    created_lte: z.string().optional().transform((val) => (val ? new Date(val) : undefined)),
});

export type ListPaymentIntentsQuery = z.infer<typeof ListPaymentIntentsQuerySchema>;

/**
 * Helper to parse and validate request body
 */
export async function parseBody<T>(
    request: Request,
    schema: z.ZodSchema<T>
): Promise<{ success: true; data: T } | { success: false; errors: z.ZodError }> {
    try {
        const body = await request.json();
        const result = schema.safeParse(body);

        if (result.success) {
            return { success: true, data: result.data };
        }

        return { success: false, errors: result.error };
    } catch {
        return {
            success: false,
            errors: new z.ZodError([
                {
                    code: 'custom',
                    message: 'Invalid JSON body',
                    path: [],
                },
            ]),
        };
    }
}

/**
 * Helper to parse query parameters
 */
export function parseQuery<T>(
    searchParams: URLSearchParams,
    schema: z.ZodSchema<T>
): { success: true; data: T } | { success: false; errors: z.ZodError } {
    const params: Record<string, string> = {};
    searchParams.forEach((value, key) => {
        params[key] = value;
    });

    const result = schema.safeParse(params);

    if (result.success) {
        return { success: true, data: result.data };
    }

    return { success: false, errors: result.error };
}

/**
 * Format Zod errors for API response
 */
export function formatZodErrors(errors: z.ZodError): Record<string, string[]> {
    const formatted: Record<string, string[]> = {};

    for (const issue of errors.issues) {
        const path = issue.path.join('.') || '_root';
        if (!formatted[path]) {
            formatted[path] = [];
        }
        formatted[path]!.push(issue.message);
    }

    return formatted;
}
