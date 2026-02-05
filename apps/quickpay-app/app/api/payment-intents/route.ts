/**
 * Payment Intents API Routes
 * POST - Create new payment intent
 * GET - List payment intents
 */

import { withApiAuth, type AuthenticatedContext } from '../../lib/api-auth';
import { Errors } from '../../lib/api-error';
import {
    parseIdempotencyKey,
    isValidUUID,
    checkIdempotency,
    createIdempotentResponse,
} from '../../lib/idempotency';
import {
    CreatePaymentIntentSchema,
    ListPaymentIntentsQuerySchema,
    parseBody,
    parseQuery,
    formatZodErrors,
} from '../../lib/validations/payment';
import {
    createPaymentIntent,
    listPaymentIntents,
} from '../../lib/services/payment';

/**
 * POST /api/payment-intents
 * Create a new payment intent
 */
export const POST = withApiAuth(async (request: Request, { merchant }: AuthenticatedContext) => {
    // Check for idempotency key
    const idempotencyKey = parseIdempotencyKey(request);

    if (idempotencyKey) {
        // Validate UUID format
        if (!isValidUUID(idempotencyKey)) {
            throw Errors.invalidIdempotencyKey();
        }

        // Check if this key was already used
        const idempotencyCheck = await checkIdempotency(idempotencyKey, merchant.id);

        if (idempotencyCheck.exists && idempotencyCheck.paymentIntent) {
            return createIdempotentResponse(idempotencyCheck.paymentIntent);
        }
    }

    // Parse and validate request body
    const parseResult = await parseBody(request, CreatePaymentIntentSchema);

    if (!parseResult.success) {
        throw Errors.validationError(formatZodErrors(parseResult.errors));
    }

    // Create the payment intent
    const paymentIntent = await createPaymentIntent(
        merchant.id,
        parseResult.data,
        idempotencyKey ?? undefined
    );

    return Response.json(paymentIntent, { status: 201 });
});

/**
 * GET /api/payment-intents
 * List payment intents with filters
 */
export const GET = withApiAuth(async (request: Request, { merchant }: AuthenticatedContext) => {
    const url = new URL(request.url);

    // Parse and validate query parameters
    const parseResult = parseQuery(url.searchParams, ListPaymentIntentsQuerySchema);

    if (!parseResult.success) {
        throw Errors.validationError(formatZodErrors(parseResult.errors));
    }

    // List payment intents
    const result = await listPaymentIntents(merchant.id, parseResult.data);

    return Response.json(result);
});
