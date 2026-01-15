/**
 * Wallet API Route
 * GET - Get wallet balance and recent transactions
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../lib/auth';
import { getWalletWithTransactions } from '../../lib/services/wallet';
import { Errors, ApiError } from '../../lib/api-error';

/**
 * GET /api/wallet
 * Returns current user's wallet balance and recent transactions
 * Requires user authentication (NextAuth session)
 */
export async function GET() {
    try {
        // Get user session
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            throw Errors.unauthorized('User session required');
        }

        const userId = parseInt(session.user.id, 10);

        // Get wallet with recent transactions
        const wallet = await getWalletWithTransactions(userId, 5);

        return NextResponse.json(wallet);
    } catch (error) {
        if (error instanceof ApiError) {
            return error.toResponse();
        }
        console.error('[Wallet API] Error:', error);
        return Errors.internal().toResponse();
    }
}
