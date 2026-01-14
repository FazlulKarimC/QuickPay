/**
 * Standardized API Error Handling
 * Provides consistent error responses across all API endpoints
 */

export type ErrorCode =
  | 'rate_limit_exceeded'
  | 'invalid_api_key'
  | 'unauthorized'
  | 'invalid_idempotency_key'
  | 'idempotency_key_in_use'
  | 'resource_not_found'
  | 'validation_error'
  | 'payment_failed'
  | 'insufficient_funds'
  | 'invalid_payment_status'
  | 'internal_error';

interface ErrorDetails {
  [key: string]: unknown;
}

export interface ApiErrorResponse {
  error: {
    code: ErrorCode;
    message: string;
    details?: ErrorDetails;
  };
}

/**
 * Custom API Error class for consistent error handling
 */
export class ApiError extends Error {
  code: ErrorCode;
  statusCode: number;
  details?: ErrorDetails;

  constructor(
    code: ErrorCode,
    message: string,
    statusCode: number = 500,
    details?: ErrorDetails
  ) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }

  /**
   * Convert error to JSON response format
   */
  toJSON(): ApiErrorResponse {
    return {
      error: {
        code: this.code,
        message: this.message,
        ...(this.details && { details: this.details }),
      },
    };
  }

  /**
   * Create a NextResponse from this error
   */
  toResponse(): Response {
    return Response.json(this.toJSON(), { status: this.statusCode });
  }
}

// Pre-defined error factories for common errors

export const Errors = {
  rateLimitExceeded: (retryAfter: number) =>
    new ApiError(
      'rate_limit_exceeded',
      'Too many requests. Please retry later.',
      429,
      { retryAfter }
    ),

  invalidApiKey: () =>
    new ApiError(
      'invalid_api_key',
      'Invalid or missing API key',
      401
    ),

  unauthorized: (message = 'Authentication required') =>
    new ApiError('unauthorized', message, 401),

  invalidIdempotencyKey: () =>
    new ApiError(
      'invalid_idempotency_key',
      'Idempotency key must be a valid UUID v4',
      400
    ),

  idempotencyKeyInUse: (existingId: string) =>
    new ApiError(
      'idempotency_key_in_use',
      'Idempotency key has already been used for a different request',
      409,
      { existingPaymentIntentId: existingId }
    ),

  notFound: (resource: string) =>
    new ApiError(
      'resource_not_found',
      `${resource} not found`,
      404
    ),

  validationError: (details: ErrorDetails) =>
    new ApiError(
      'validation_error',
      'Request validation failed',
      400,
      details
    ),

  paymentFailed: (reason: string) =>
    new ApiError(
      'payment_failed',
      `Payment failed: ${reason}`,
      400,
      { reason }
    ),

  insufficientFunds: (required: number, available: number) =>
    new ApiError(
      'insufficient_funds',
      'Insufficient wallet balance',
      400,
      { required, available }
    ),

  invalidPaymentStatus: (currentStatus: string, expectedStatuses: string[]) =>
    new ApiError(
      'invalid_payment_status',
      `Payment cannot be modified in its current status`,
      400,
      { currentStatus, expectedStatuses }
    ),

  internal: (message = 'An unexpected error occurred') =>
    new ApiError('internal_error', message, 500),
};

/**
 * Wrap an async handler to catch errors and return proper responses
 */
export function withErrorHandler(
  handler: (request: Request, context?: unknown) => Promise<Response>
): (request: Request, context?: unknown) => Promise<Response> {
  return async (request: Request, context?: unknown) => {
    try {
      return await handler(request, context);
    } catch (error) {
      if (error instanceof ApiError) {
        return error.toResponse();
      }

      console.error('Unhandled API error:', error);
      return Errors.internal().toResponse();
    }
  };
}
