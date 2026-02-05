/**
 * Rate Limiting Module
 * Implements sliding window rate limiting using the RateLimitEntry Prisma model
 */

import db from '@repo/db/client';

// Configuration from environment variables
const DEFAULT_WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10);
const DEFAULT_PUBLIC_LIMIT = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10);
const DEFAULT_API_LIMIT = parseInt(process.env.RATE_LIMIT_MAX_API_REQUESTS || '1000', 10);

export interface RateLimitResult {
    allowed: boolean;
    limit: number;
    remaining: number;
    resetTime: Date;
    retryAfter?: number; // seconds until reset, only set when blocked
}

export interface RateLimitConfig {
    limit?: number;
    windowMs?: number;
}

/**
 * Check if a request is allowed based on rate limiting
 * Uses sliding window counter algorithm stored in database
 * 
 * @param key - Unique identifier (e.g., "ip:192.168.1.1" or "merchant:123")
 * @param config - Optional configuration for limit and window
 */
export async function checkRateLimit(
    key: string,
    config: RateLimitConfig = {}
): Promise<RateLimitResult> {
    const { limit = DEFAULT_PUBLIC_LIMIT, windowMs = DEFAULT_WINDOW_MS } = config;
    const now = new Date();
    const windowStart = new Date(now.getTime() - windowMs);

    try {
        // Get or create rate limit entry for current window
        // We use upsert to atomically increment the counter
        const result = await db.$transaction(async (tx) => {
            // Get current window entry
            const currentEntry = await tx.rateLimitEntry.findFirst({
                where: {
                    key,
                    windowStart: {
                        gte: windowStart,
                    },
                },
                orderBy: {
                    windowStart: 'desc',
                },
            });

            if (currentEntry) {
                // Increment existing entry
                const updated = await tx.rateLimitEntry.update({
                    where: { id: currentEntry.id },
                    data: { count: { increment: 1 } },
                });

                return {
                    count: updated.count,
                    windowStart: updated.windowStart,
                };
            } else {
                // Create new entry for this window
                const newEntry = await tx.rateLimitEntry.create({
                    data: {
                        key,
                        count: 1,
                        windowStart: now,
                    },
                });

                return {
                    count: newEntry.count,
                    windowStart: newEntry.windowStart,
                };
            }
        });

        const remaining = Math.max(0, limit - result.count);
        const resetTime = new Date(result.windowStart.getTime() + windowMs);
        const allowed = result.count <= limit;

        return {
            allowed,
            limit,
            remaining,
            resetTime,
            ...(allowed ? {} : { retryAfter: Math.ceil((resetTime.getTime() - now.getTime()) / 1000) }),
        };
    } catch (error) {
        console.error('Rate limit check failed:', error);
        // On error, allow the request but log the issue
        return {
            allowed: true,
            limit,
            remaining: limit,
            resetTime: new Date(now.getTime() + windowMs),
        };
    }
}

/**
 * Get rate limit headers to include in response
 */
export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
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

/**
 * Cleanup old rate limit entries from the database
 * Should be called periodically (e.g., via cron job)
 * 
 * @param maxAgeMs - Maximum age of entries to keep (default: 2x window)
 */
export async function cleanupOldEntries(maxAgeMs: number = DEFAULT_WINDOW_MS * 2): Promise<number> {
    const cutoff = new Date(Date.now() - maxAgeMs);

    try {
        const result = await db.rateLimitEntry.deleteMany({
            where: {
                windowStart: {
                    lt: cutoff,
                },
            },
        });

        return result.count;
    } catch (error) {
        console.error('Failed to cleanup rate limit entries:', error);
        return 0;
    }
}

// Export configuration for use in middleware
export const RateLimitDefaults = {
    PUBLIC_LIMIT: DEFAULT_PUBLIC_LIMIT,
    API_LIMIT: DEFAULT_API_LIMIT,
    WINDOW_MS: DEFAULT_WINDOW_MS,
};
