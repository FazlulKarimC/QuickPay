/**
 * Single Payment Intent API Route
 * GET - Get payment intent by ID
 */

import { withApiAuth } from '../../../lib/api-auth';
import { getPaymentIntent } from '../../../lib/services/payment';

/**
 * GET /api/payment-intents/[id]
 * Get a single payment intent by ID
 */
export const GET = withApiAuth(async (request, { merchant, params }) => {
    const resolvedParams = await params;
    const id = resolvedParams?.id;

    if (!id) {
        return Response.json({ error: { code: 'validation_error', message: 'Missing payment intent ID' } }, { status: 400 });
    }

    const paymentIntent = await getPaymentIntent(id, merchant.id);

    return Response.json(paymentIntent);
});
