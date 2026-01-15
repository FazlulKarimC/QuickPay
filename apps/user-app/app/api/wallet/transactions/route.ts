/**
 * Wallet Transactions API Route
 * GET - Get full transaction history with pagination
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';
import { getTransactions } from '../../../lib/services/wallet';
import { Errors, ApiError } from '../../../lib/api-error';
import {
    WalletTransactionsQuerySchema,
    parseQueryParams,
} from '../../../lib/validations/wallet';
import type { TransactionType } from '@repo/db/client';

/**
 * GET /api/wallet/transactions
 * Returns paginated transaction history for current user
 * 
 * Query params:
 *   type - Filter by transaction type (credit, debit, p2p_sent, p2p_received)
 *   limit - Results per page (default: 20, max: 100)
 *   starting_after - Cursor for pagination
 */
export async function GET(request: NextRequest) {
    try {
        // Get user session
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            throw Errors.unauthorized('User session required');
        }

        const userId = parseInt(session.user.id, 10);

        // Parse and validate query params
        const { searchParams } = new URL(request.url);
        const parseResult = parseQueryParams(searchParams, WalletTransactionsQuerySchema);

        if (!parseResult.success) {
            throw Errors.validationError({
                message: 'Invalid query parameters',
                errors: parseResult.errors.flatten().fieldErrors,
            });
        }

        const { type, limit, starting_after } = parseResult.data;

        // Get transactions
        const result = await getTransactions(userId, {
            type: type as TransactionType | undefined,
            limit,
            starting_after,
        });

        return NextResponse.json(result);
    } catch (error) {
        if (error instanceof ApiError) {
            return error.toResponse();
        }
        console.error('[Wallet Transactions API] Error:', error);
        return Errors.internal().toResponse();
    }
}
