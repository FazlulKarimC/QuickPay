/**
 * Refund Payment Intent API Route
 * POST - Refund a payment intent
 */

import { withApiAuth } from '../../../../lib/api-auth';
import { refundPayment } from '../../../../lib/services/payment';

/**
 * POST /api/payment-intents/[id]/refund
 * Refund a succeeded payment intent
 */
export const POST = withApiAuth(async (request, { merchant, params }) => {
    const resolvedParams = await params;
    const id = resolvedParams?.id;

    if (!id) {
        return Response.json({ error: { code: 'validation_error', message: 'Missing payment intent ID' } }, { status: 400 });
    }

    // Refund the payment
    const paymentIntent = await refundPayment(id, merchant.id);

    return Response.json(paymentIntent);
});
