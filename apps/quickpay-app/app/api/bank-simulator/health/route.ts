/**
 * Bank Simulator - Health Check Endpoint
 * Returns service status and configuration
 */

import { NextResponse } from 'next/server';

// Configuration from environment
const SUCCESS_RATE = parseFloat(process.env.BANK_SUCCESS_RATE || '0.8');
const MIN_DELAY_MS = parseInt(process.env.BANK_MIN_DELAY_MS || '2000', 10);
const MAX_DELAY_MS = parseInt(process.env.BANK_MAX_DELAY_MS || '5000', 10);

export async function GET() {
    return NextResponse.json({
        status: 'ok',
        service: 'bank-simulator',
        config: {
            successRate: SUCCESS_RATE,
            minDelayMs: MIN_DELAY_MS,
            maxDelayMs: MAX_DELAY_MS,
        },
        timestamp: new Date().toISOString(),
    });
}
