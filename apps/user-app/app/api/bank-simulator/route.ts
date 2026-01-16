/**
 * Bank Simulator - Root Endpoint
 * Returns service information
 */

import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json({
        message: 'Bank Simulator Service',
        version: '2.0.0',
        endpoints: {
            health: 'GET /api/bank-simulator/health',
            process: 'POST /api/bank-simulator/process',
        },
    });
}
