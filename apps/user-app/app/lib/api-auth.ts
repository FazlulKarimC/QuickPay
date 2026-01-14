/**
 * API Key Authentication Module
 * Authenticates merchants via X-API-Key header
 */

import db from '@repo/db/client';
import type { Merchant } from '@repo/db/client';
import { Errors, withErrorHandler } from './api-error';

/**
 * Parse API key from request headers
 * @returns The API key or null if not provided
 */
export function parseApiKey(request: Request): string | null {
    const apiKey = request.headers.get('X-API-Key');
    return apiKey?.trim() || null;
}

/**
 * Authenticate a merchant by their API key
 * @returns The merchant object or null if not found
 */
export async function authenticateMerchant(apiKey: string): Promise<Merchant | null> {
    try {
        const merchant = await db.merchant.findUnique({
            where: { apiKey },
        });

        return merchant;
    } catch (error) {
        console.error('Merchant authentication failed:', error);
        return null;
    }
}

/**
 * Context for authenticated requests
 */
export interface AuthenticatedContext {
    merchant: Merchant;
}

/**
 * Type for API route handlers
 */
export type ApiHandler<T = unknown> = (
    request: Request,
    context: T
) => Promise<Response>;

/**
 * Higher-order function to wrap API routes with authentication
 * Use this to protect routes that require a valid API key
 * 
 * @example
 * export const POST = withApiAuth(async (request, { merchant }) => {
 *   // merchant is guaranteed to exist here
 *   return Response.json({ merchantId: merchant.id });
 * });
 */
export function withApiAuth(
    handler: ApiHandler<AuthenticatedContext>
): (request: Request, context?: unknown) => Promise<Response> {
    return withErrorHandler(async (request: Request) => {
        const apiKey = parseApiKey(request);

        if (!apiKey) {
            throw Errors.invalidApiKey();
        }

        const merchant = await authenticateMerchant(apiKey);

        if (!merchant) {
            throw Errors.invalidApiKey();
        }

        return handler(request, { merchant });
    });
}

/**
 * Optional authentication wrapper
 * Passes merchant if authenticated, null otherwise
 * Use this for routes that work with optional authentication
 */
export interface OptionalAuthContext {
    merchant: Merchant | null;
}

export function withOptionalAuth(
    handler: ApiHandler<OptionalAuthContext>
): (request: Request, context?: unknown) => Promise<Response> {
    return withErrorHandler(async (request: Request) => {
        const apiKey = parseApiKey(request);
        let merchant: Merchant | null = null;

        if (apiKey) {
            merchant = await authenticateMerchant(apiKey);
        }

        return handler(request, { merchant });
    });
}
