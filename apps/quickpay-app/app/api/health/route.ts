/**
 * Health Check Endpoint
 * Simple endpoint for testing API availability and rate limiting
 */

export async function GET() {
    return Response.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'quickpay-user-app',
        version: '1.0.0',
    });
}
