/**
 * Health Check Endpoint
 * Simple endpoint for testing API availability and rate limiting
 */

import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
    return Response.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'quickpay-user-app',
        version: '1.0.0',
    });
}
