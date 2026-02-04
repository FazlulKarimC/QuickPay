/**
 * Next.js Proxy for Rate Limiting
 * Applies rate limits to all /api/* routes
 * 
 * Note: In Next.js 16, proxy.ts replaces middleware.ts
 * This file must be self-contained (no app/lib imports)
 */

import { NextResponse, NextRequest } from 'next/server';
import { createHash } from 'crypto';

// ============================================================================
// Configuration
// ============================================================================

/**
 * Parse and validate an environment variable as a positive integer
 */
function parseEnvInt(value: string | undefined, defaultValue: number, name: string): number {
    if (!value) return defaultValue;
    const parsed = parseInt(value, 10);
    if (!Number.isFinite(parsed) || parsed <= 0) {
        console.warn(
            `[RateLimit] Invalid ${name}: "${value}", using default: ${defaultValue}`
        );
        return defaultValue;
    }
    return parsed;
}

// Validated configuration from environment variables
const RATE_LIMIT_WINDOW_MS = parseEnvInt(
    process.env.RATE_LIMIT_WINDOW_MS,
    60000,
    'RATE_LIMIT_WINDOW_MS'
);
const RATE_LIMIT_MAX_REQUESTS = parseEnvInt(
    process.env.RATE_LIMIT_MAX_REQUESTS,
    100,
    'RATE_LIMIT_MAX_REQUESTS'
);
const RATE_LIMIT_MAX_API_REQUESTS = parseEnvInt(
    process.env.RATE_LIMIT_MAX_API_REQUESTS,
    1000,
    'RATE_LIMIT_MAX_API_REQUESTS'
);

// Trusted proxy IPs (only accept X-Forwarded-For from these)
// In production, set this to your load balancer/reverse proxy IPs
const TRUSTED_PROXIES = new Set(
    (process.env.TRUSTED_PROXY_IPS || '127.0.0.1,::1').split(',').map(ip => ip.trim())
);

// Maximum entries in rate limit store (prevents unbounded memory growth)
const MAX_RATE_LIMIT_ENTRIES = parseEnvInt(
    process.env.MAX_RATE_LIMIT_ENTRIES,
    10000,
    'MAX_RATE_LIMIT_ENTRIES'
);

// Cleanup interval (run every window period)
const CLEANUP_INTERVAL_MS = RATE_LIMIT_WINDOW_MS;

// ============================================================================
// Rate Limit Store with Automatic Eviction
// ============================================================================

interface RateLimitEntry {
    count: number;
    windowStart: number;
}

/**
 * Bounded rate limit store with automatic cleanup
 */
class BoundedRateLimitStore {
    private store = new Map<string, RateLimitEntry>();
    private cleanupTimer: ReturnType<typeof setInterval> | null = null;

    constructor() {
        // Start cleanup timer in development (production should use Redis)
        if (process.env.NODE_ENV !== 'production') {
            this.startCleanup();
        }
    }

    private startCleanup(): void {
        this.cleanupTimer = setInterval(() => {
            this.evictExpired();
        }, CLEANUP_INTERVAL_MS);

        // Don't block process exit
        if (this.cleanupTimer.unref) {
            this.cleanupTimer.unref();
        }
    }

    /**
     * Evict expired entries to free memory
     */
    private evictExpired(): void {
        const now = Date.now();
        let evicted = 0;

        for (const [key, entry] of this.store) {
            if (now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
                this.store.delete(key);
                evicted++;
            }
        }

        if (evicted > 0) {
            console.log(`[RateLimit] Cleanup: evicted ${evicted} expired entries`);
        }
    }

    /**
     * Enforce maximum size by removing oldest entries
     */
    private enforceMaxSize(): void {
        if (this.store.size <= MAX_RATE_LIMIT_ENTRIES) return;

        // Remove oldest entries (first entries in Map are oldest)
        const toRemove = this.store.size - MAX_RATE_LIMIT_ENTRIES;
        let removed = 0;

        for (const key of this.store.keys()) {
            if (removed >= toRemove) break;
            this.store.delete(key);
            removed++;
        }

        console.warn(
            `[RateLimit] Store at capacity, removed ${removed} oldest entries`
        );
    }

    get(key: string): RateLimitEntry | undefined {
        return this.store.get(key);
    }

    set(key: string, entry: RateLimitEntry): void {
        this.enforceMaxSize();
        this.store.set(key, entry);
    }

    delete(key: string): boolean {
        return this.store.delete(key);
    }

    /**
     * Stop cleanup timer (for graceful shutdown)
     */
    stop(): void {
        if (this.cleanupTimer) {
            clearInterval(this.cleanupTimer);
            this.cleanupTimer = null;
        }
    }
}

// In-memory rate limit store (for development/single instance)
// In production, use Redis or similar distributed store
const rateLimitStore = new BoundedRateLimitStore();

// Routes to exclude from rate limiting
const EXCLUDED_ROUTES = ['/api/auth'];

// ============================================================================
// Client Identification (with IP spoofing protection)
// ============================================================================

/**
 * Generate a stable anonymous client identifier
 * Used when IP cannot be determined reliably
 */
function generateAnonymousClientId(request: NextRequest): string {
    // Create a hash from available client information
    const userAgent = request.headers.get('user-agent') || 'unknown-ua';
    const acceptLanguage = request.headers.get('accept-language') || 'unknown-lang';
    const acceptEncoding = request.headers.get('accept-encoding') || 'unknown-enc';

    // Create a semi-stable fingerprint (not perfect, but better than shared bucket)
    const data = `${userAgent}|${acceptLanguage}|${acceptEncoding}`;
    const hash = createHash('sha256').update(data).digest('hex').substring(0, 16);

    return `anon:${hash}`;
}

/**
 * Check if the immediate connection is from a trusted proxy
 * Note: In Next.js/Vercel, we may not have access to socket.remoteAddress
 * so we use a header-based approach with trusted proxy list
 */
function isFromTrustedProxy(request: NextRequest): boolean {
    // Check x-vercel-proxied or similar headers that indicate trusted proxy
    const vercelProxied = request.headers.get('x-vercel-id');
    if (vercelProxied) {
        return true; // Vercel's edge network is trusted
    }

    // Check if x-real-ip is set (typically set by trusted reverse proxies)
    const realIp = request.headers.get('x-real-ip');
    if (realIp && TRUSTED_PROXIES.has(realIp)) {
        return true;
    }

    return false;
}

/**
 * Extract client identifier for rate limiting
 * Uses API key if present, otherwise IP address with spoofing protection
 */
function getClientKey(request: NextRequest): { key: string; isAuthenticated: boolean } {
    // Check for API key first (highest priority)
    const apiKey = request.headers.get('X-API-Key');
    if (apiKey) {
        return {
            key: `api:${apiKey}`,
            isAuthenticated: true,
        };
    }

    // Determine IP address with spoofing protection
    let ip: string | null = null;

    // Only trust X-Forwarded-For from trusted proxies
    if (isFromTrustedProxy(request)) {
        const forwarded = request.headers.get('x-forwarded-for');
        if (forwarded) {
            // Take the first (client) IP from the chain
            ip = forwarded.split(',')[0]?.trim() || null;
        }
    }

    // Fall back to x-real-ip (typically set by nginx/load balancer)
    if (!ip) {
        ip = request.headers.get('x-real-ip');
    }

    // If we still don't have an IP, generate anonymous client ID
    if (!ip) {
        console.warn(
            '[RateLimit] Unable to determine client IP, using anonymous fingerprint. ' +
            'Consider configuring TRUSTED_PROXY_IPS or ensuring x-real-ip header is set.'
        );
        const anonId = generateAnonymousClientId(request);
        return {
            key: anonId,
            isAuthenticated: false,
        };
    }

    // Normalize IPv6 localhost to IPv4
    if (ip === '::1') {
        ip = '127.0.0.1';
    }

    return {
        key: `ip:${ip}`,
        isAuthenticated: false,
    };
}

// ============================================================================
// Rate Limit Logic
// ============================================================================

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

// ============================================================================
// Proxy Handler
// ============================================================================

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
