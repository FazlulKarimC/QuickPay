/**
 * Bank Simulator - Process Payment Endpoint
 * Simulates async bank payment processing with webhook callback
 */

import { NextRequest, NextResponse } from 'next/server';

// Configuration from environment
const SUCCESS_RATE = parseFloat(process.env.BANK_SUCCESS_RATE || '0.8');
const MIN_DELAY_MS = parseInt(process.env.BANK_MIN_DELAY_MS || '2000', 10);
const MAX_DELAY_MS = parseInt(process.env.BANK_MAX_DELAY_MS || '5000', 10);

// Allowed callback URL domains (for production security)
// In production, set this to your actual domain(s)
const ALLOWED_CALLBACK_DOMAINS = new Set(
    (process.env.ALLOWED_CALLBACK_DOMAINS || 'localhost:3000').split(',').map(d => d.trim().toLowerCase())
);

// Blocked hostnames and IPs for SSRF prevention
const BLOCKED_HOSTS = new Set([
    'localhost',
    '127.0.0.1',
    '0.0.0.0',
    '::1',
    '169.254.169.254', // AWS/GCP/Azure metadata
    '169.254.170.2',   // AWS ECS metadata
    'metadata.google.internal',
    'metadata.gcp.internal',
]);

// Blocked IP ranges (private networks)
const BLOCKED_IP_PATTERNS = [
    /^10\./,           // 10.0.0.0/8
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // 172.16.0.0/12
    /^192\.168\./,     // 192.168.0.0/16
    /^fc00:/i,         // IPv6 unique local
    /^fe80:/i,         // IPv6 link-local
];

interface ProcessRequest {
    paymentIntentId: string;
    amount: number;
    method: string;
    callbackUrl: string;
}

interface CallbackPayload {
    paymentIntentId: string;
    status: 'succeeded' | 'failed';
    processedAt: string;
    failureReason?: string;
    bankReference?: string;
}

/**
 * Validate callback URL to prevent SSRF attacks
 * Returns { valid: true, url: URL } or { valid: false, reason: string }
 */
function validateCallbackUrl(urlString: string): { valid: true; url: URL } | { valid: false; reason: string } {
    let url: URL;

    try {
        url = new URL(urlString);
    } catch {
        return { valid: false, reason: 'Invalid URL format' };
    }

    const hostname = url.hostname.toLowerCase();
    const isProduction = process.env.NODE_ENV === 'production';

    // 1. Enforce HTTPS in production
    if (isProduction && url.protocol !== 'https:') {
        return { valid: false, reason: 'HTTPS required in production' };
    }

    // 2. Allow HTTP only in development
    if (!isProduction && url.protocol !== 'http:' && url.protocol !== 'https:') {
        return { valid: false, reason: 'Only HTTP/HTTPS protocols allowed' };
    }

    // 3. In development, allow localhost but block other internal IPs
    const isDevelopment = !isProduction;
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';

    if (isDevelopment && isLocalhost) {
        // Allow localhost in development
        return { valid: true, url };
    }

    // 4. Block internal/metadata hostnames
    if (BLOCKED_HOSTS.has(hostname)) {
        return { valid: false, reason: `Blocked hostname: ${hostname}` };
    }

    // 5. Block private IP ranges
    for (const pattern of BLOCKED_IP_PATTERNS) {
        if (pattern.test(hostname)) {
            return { valid: false, reason: `Blocked private IP range: ${hostname}` };
        }
    }

    // 6. In production, use allowlist if configured
    if (isProduction && ALLOWED_CALLBACK_DOMAINS.size > 0) {
        const hostWithPort = url.port ? `${hostname}:${url.port}` : hostname;
        if (!ALLOWED_CALLBACK_DOMAINS.has(hostname) && !ALLOWED_CALLBACK_DOMAINS.has(hostWithPort)) {
            return { valid: false, reason: `Domain not in allowlist: ${hostname}` };
        }
    }

    return { valid: true, url };
}

/**
 * Generate a random delay between MIN_DELAY_MS and MAX_DELAY_MS
 */
function getRandomDelay(): number {
    return Math.floor(Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS + 1)) + MIN_DELAY_MS;
}

/**
 * Generate a random bank reference for successful transactions
 */
function generateBankReference(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `BANK-${timestamp}-${random}`;
}

/**
 * Determine if payment should succeed based on SUCCESS_RATE
 */
function shouldSucceed(): boolean {
    return Math.random() < SUCCESS_RATE;
}

/**
 * Get a random failure reason
 */
function getRandomFailureReason(): string {
    const reasons = [
        'Insufficient funds',
        'Card declined by issuer',
        'Transaction timeout',
        'Invalid card details',
        'Bank server unavailable',
        'Daily transaction limit exceeded',
        'Suspected fraud - transaction blocked',
    ];
    return reasons[Math.floor(Math.random() * reasons.length)] || 'Unknown error';
}

/**
 * Process the payment and call webhook
 * This is the async work that happens after the response is sent
 */
async function processPaymentAsync(
    paymentIntentId: string,
    callbackUrl: string,
    delayMs: number
): Promise<void> {
    // Simulate bank processing delay
    await new Promise(resolve => setTimeout(resolve, delayMs));

    const success = shouldSucceed();
    const processedAt = new Date().toISOString();

    const payload: CallbackPayload = {
        paymentIntentId,
        status: success ? 'succeeded' : 'failed',
        processedAt,
    };

    if (success) {
        payload.bankReference = generateBankReference();
        console.log(`[Bank Simulator] Payment ${paymentIntentId} SUCCEEDED`);
        console.log(`  Bank Reference: ${payload.bankReference}`);
    } else {
        payload.failureReason = getRandomFailureReason();
        console.log(`[Bank Simulator] Payment ${paymentIntentId} FAILED`);
        console.log(`  Reason: ${payload.failureReason}`);
    }

    // Call webhook
    try {
        console.log(`[Bank Simulator] Calling webhook: ${callbackUrl}`);
        const response = await fetch(callbackUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Bank-Simulator': 'true',
            },
            body: JSON.stringify(payload),
        });

        if (response.ok) {
            console.log(`[Bank Simulator] Webhook delivered successfully`);
        } else {
            console.error(`[Bank Simulator] Webhook failed: ${response.status}`);
        }
    } catch (error) {
        console.error(`[Bank Simulator] Webhook error:`, error);
    }
}

/**
 * POST /api/bank-simulator/process
 * Process a payment request asynchronously
 */
export async function POST(request: NextRequest) {
    try {
        const body: ProcessRequest = await request.json();
        const { paymentIntentId, amount, method, callbackUrl } = body;

        // Validate required fields
        if (!paymentIntentId || !amount || !method || !callbackUrl) {
            return NextResponse.json(
                { error: 'Missing required fields: paymentIntentId, amount, method, callbackUrl' },
                { status: 400 }
            );
        }

        // Validate callback URL to prevent SSRF
        const urlValidation = validateCallbackUrl(callbackUrl);
        if (!urlValidation.valid) {
            console.warn(`[Bank Simulator] SSRF attempt blocked: ${callbackUrl} - ${urlValidation.reason}`);
            return NextResponse.json(
                { error: `Invalid callback URL: ${urlValidation.reason}` },
                { status: 400 }
            );
        }

        const estimatedDelay = getRandomDelay();

        console.log(`[Bank Simulator] Processing payment ${paymentIntentId}`);
        console.log(`  Amount: ${amount} paise`);
        console.log(`  Method: ${method}`);
        console.log(`  Estimated delay: ${estimatedDelay}ms`);

        // Use waitUntil if available (Vercel, Cloudflare, etc.)
        // This allows the async work to continue after response is sent.
        const waitUntil = (request as NextRequest & {
            waitUntil?: (promise: Promise<void>) => void;
        }).waitUntil;

        if (typeof waitUntil === 'function') {
            // Serverless-compatible: use waitUntil to keep execution alive
            waitUntil(processPaymentAsync(paymentIntentId, callbackUrl, estimatedDelay));
        } else {
            // Fallback for traditional servers: use setTimeout
            // Note: This may not work in all serverless environments
            console.log('[Bank Simulator] waitUntil not available, using setTimeout fallback');
            setTimeout(() => {
                processPaymentAsync(paymentIntentId, callbackUrl, estimatedDelay);
            }, 0);
        }

        // Return immediate acknowledgment
        return NextResponse.json({
            received: true,
            paymentIntentId,
            estimatedDelayMs: estimatedDelay,
            message: 'Payment is being processed',
        });
    } catch (error) {
        console.error('[Bank Simulator] Error processing request:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
