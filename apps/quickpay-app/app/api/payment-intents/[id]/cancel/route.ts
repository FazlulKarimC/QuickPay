/**
 * Cancel Payment Intent API Route
 * POST - Cancel a payment intent
 */

import { withApiAuth } from '../../../../lib/api-auth';
import { cancelPayment } from '../../../../lib/services/payment';

/**
 * POST /api/payment-intents/[id]/cancel
 * Cancel a payment intent
 */
export const POST = withApiAuth(async (request, { merchant, params }) => {
    const resolvedParams = await params;
    const id = resolvedParams?.id;

    if (!id) {
        return Response.json({ error: { code: 'validation_error', message: 'Missing payment intent ID' } }, { status: 400 });
    }

    // Cancel the payment
    const paymentIntent = await cancelPayment(id, merchant.id);

    return Response.json(paymentIntent);
});
