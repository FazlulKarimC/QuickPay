/**
 * User Payment Status API Route
 * GET - Get payment intent status for current user
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import prisma from '@repo/db/client';

/**
 * GET /api/user/payment-status/[id]
 * Get payment intent status for the current authenticated user
 */
export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const resolvedParams = await params;
        const paymentIntentId = resolvedParams.id;

        if (!paymentIntentId) {
            return NextResponse.json(
                { error: 'Missing payment intent ID' },
                { status: 400 }
            );
        }

        // Fetch the payment intent and verify it belongs to the user
        const paymentIntent = await prisma.paymentIntent.findUnique({
            where: {
                id: paymentIntentId,
            },
        });

        if (!paymentIntent) {
            return NextResponse.json(
                { error: 'Payment intent not found' },
                { status: 404 }
            );
        }

        // Verify the payment intent belongs to the current user
        if (paymentIntent.userId !== Number(session.user.id)) {
            return NextResponse.json(
                { error: 'Forbidden' },
                { status: 403 }
            );
        }

        // Return payment intent status
        return NextResponse.json({
            id: paymentIntent.id,
            status: paymentIntent.status,
            amount: paymentIntent.amount,
            currency: paymentIntent.currency,
            failureReason: paymentIntent.failureReason,
            createdAt: paymentIntent.createdAt,
        });
    } catch (error) {
        console.error('[User Payment Status] Error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
