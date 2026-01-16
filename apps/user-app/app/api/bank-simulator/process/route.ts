/**
 * Bank Simulator - Process Payment Endpoint
 * Simulates async bank payment processing with webhook callback
 */

import { NextRequest, NextResponse } from 'next/server';

// Configuration from environment
const SUCCESS_RATE = parseFloat(process.env.BANK_SUCCESS_RATE || '0.8');
const MIN_DELAY_MS = parseInt(process.env.BANK_MIN_DELAY_MS || '2000', 10);
const MAX_DELAY_MS = parseInt(process.env.BANK_MAX_DELAY_MS || '5000', 10);

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

        const estimatedDelay = getRandomDelay();

        console.log(`[Bank Simulator] Processing payment ${paymentIntentId}`);
        console.log(`  Amount: ${amount} paise`);
        console.log(`  Method: ${method}`);
        console.log(`  Estimated delay: ${estimatedDelay}ms`);

        // Process asynchronously using setTimeout
        // In serverless, we need to fire the callback before returning
        // Using a non-blocking approach with setTimeout wrapped in a promise
        setTimeout(async () => {
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
        }, estimatedDelay);

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
