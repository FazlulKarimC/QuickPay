/**
 * Confirm Payment Intent API Route
 * POST - Confirm a payment intent
 */

import { withApiAuth } from '../../../../lib/api-auth';
import { Errors } from '../../../../lib/api-error';
import {
    ConfirmPaymentSchema,
    parseBody,
    formatZodErrors,
} from '../../../../lib/validations/payment';
import { confirmPayment } from '../../../../lib/services/payment';

/**
 * POST /api/payment-intents/[id]/confirm
 * Confirm a payment intent for processing
 */
export const POST = withApiAuth(async (request, { merchant, params }) => {
    const resolvedParams = await params;
    const id = resolvedParams?.id;

    if (!id) {
        return Response.json({ error: { code: 'validation_error', message: 'Missing payment intent ID' } }, { status: 400 });
    }

    // Parse and validate request body
    const parseResult = await parseBody(request, ConfirmPaymentSchema);

    if (!parseResult.success) {
        throw Errors.validationError(formatZodErrors(parseResult.errors));
    }

    // Confirm the payment
    const paymentIntent = await confirmPayment(
        id,
        merchant.id,
        parseResult.data.paymentMethod
    );

    return Response.json(paymentIntent);
});
