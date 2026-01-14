/**
 * Next.js Proxy for Rate Limiting
 * Applies rate limits to all /api/* routes
 * 
 * Note: In Next.js 16, proxy.ts replaces middleware.ts
 * This file must be self-contained (no app/lib imports)
 */

import { NextResponse, NextRequest } from 'next/server';

// Configuration from environment variables (defaults for local dev)
const RATE_LIMIT_WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10);
const RATE_LIMIT_MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10);
const RATE_LIMIT_MAX_API_REQUESTS = parseInt(process.env.RATE_LIMIT_MAX_API_REQUESTS || '1000', 10);

// In-memory rate limit store (for development/single instance)
// In production, use Redis or similar distributed store
const rateLimitStore = new Map<string, { count: number; windowStart: number }>();

// Routes to exclude from rate limiting
const EXCLUDED_ROUTES = ['/api/auth'];

/**
 * Extract client identifier for rate limiting
 * Uses API key if present, otherwise IP address
 */
function getClientKey(request: NextRequest): { key: string; isAuthenticated: boolean } {
    // Check for API key first
    const apiKey = request.headers.get('X-API-Key');
    if (apiKey) {
        return {
            key: `api:${apiKey}`,
            isAuthenticated: true,
        };
    }

    // Fall back to IP address
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded?.split(',')[0]?.trim() ||
        request.headers.get('x-real-ip') ||
        'unknown';

    return {
        key: `ip:${ip}`,
        isAuthenticated: false,
    };
}

/**
 * Check rate limit using in-memory store
 */
function checkRateLimit(key: string, limit: number, windowMs: number) {
    const now = Date.now();
    const entry = rateLimitStore.get(key);

    // Cleanup old entry if window expired
    if (entry && (now - entry.windowStart) > windowMs) {
        rateLimitStore.delete(key);
    }

    const current = rateLimitStore.get(key);

    if (current) {
        current.count++;
        const remaining = Math.max(0, limit - current.count);
        const resetTime = new Date(current.windowStart + windowMs);

        return {
            allowed: current.count <= limit,
            limit,
            remaining,
            resetTime,
            retryAfter: current.count > limit
                ? Math.ceil((resetTime.getTime() - now) / 1000)
                : undefined,
        };
    }

    // Create new entry
    rateLimitStore.set(key, { count: 1, windowStart: now });

    return {
        allowed: true,
        limit,
        remaining: limit - 1,
        resetTime: new Date(now + windowMs),
    };
}

/**
 * Get rate limit headers
 */
function getRateLimitHeaders(result: ReturnType<typeof checkRateLimit>): Record<string, string> {
    const headers: Record<string, string> = {
        'X-RateLimit-Limit': result.limit.toString(),
        'X-RateLimit-Remaining': result.remaining.toString(),
        'X-RateLimit-Reset': result.resetTime.toISOString(),
    };

    if (result.retryAfter !== undefined) {
        headers['Retry-After'] = result.retryAfter.toString();
    }

    return headers;
}

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Skip rate limiting for excluded routes
    if (EXCLUDED_ROUTES.some((route) => pathname.startsWith(route))) {
        return NextResponse.next();
    }

    // Only apply rate limiting to /api/* routes
    if (!pathname.startsWith('/api')) {
        return NextResponse.next();
    }

    // Get client identifier
    const { key, isAuthenticated } = getClientKey(request);

    // Apply appropriate limit based on authentication
    const limit = isAuthenticated ? RATE_LIMIT_MAX_API_REQUESTS : RATE_LIMIT_MAX_REQUESTS;

    // Check rate limit
    const result = checkRateLimit(key, limit, RATE_LIMIT_WINDOW_MS);

    // If blocked, return 429
    if (!result.allowed) {
        const headers = getRateLimitHeaders(result);

        return new NextResponse(
            JSON.stringify({
                error: {
                    code: 'rate_limit_exceeded',
                    message: 'Too many requests. Please retry later.',
                    details: {
                        retryAfter: result.retryAfter,
                    },
                },
            }),
            {
                status: 429,
                headers: {
                    'Content-Type': 'application/json',
                    ...headers,
                },
            }
        );
    }

    // Allow request with rate limit headers
    const response = NextResponse.next();
    const headers = getRateLimitHeaders(result);

    Object.entries(headers).forEach(([headerKey, value]) => {
        response.headers.set(headerKey, value);
    });

    return response;
}

export const config = {
    matcher: ['/api/:path*'],
};

