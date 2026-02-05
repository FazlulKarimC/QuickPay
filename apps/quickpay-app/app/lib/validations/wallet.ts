/**
 * Wallet Validation Schemas
 * Zod schemas for wallet API request validation
 */

import { z } from 'zod';
import { TransactionType } from '@repo/db/client';

/**
 * Query parameters for wallet transactions endpoint
 */
export const WalletTransactionsQuerySchema = z.object({
    type: z.enum(['credit', 'debit', 'p2p_sent', 'p2p_received'] as const).optional(),
    limit: z.coerce.number().min(1).max(100).default(20),
    starting_after: z.string().optional(),
});

export type WalletTransactionsQuery = z.infer<typeof WalletTransactionsQuerySchema>;

/**
 * Parse query parameters from URL search params
 */
export function parseQueryParams<T>(
    searchParams: URLSearchParams,
    schema: z.ZodType<T>
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
