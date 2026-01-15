import express from "express";

const app = express();
app.use(express.json());

// Configuration from environment
const PORT = process.env.PORT || 3003;
const SUCCESS_RATE = parseFloat(process.env.BANK_SUCCESS_RATE || "0.8");
const MIN_DELAY_MS = parseInt(process.env.BANK_MIN_DELAY_MS || "2000", 10);
const MAX_DELAY_MS = parseInt(process.env.BANK_MAX_DELAY_MS || "5000", 10);

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
 * Health check endpoint
 */
app.get("/health", (_req, res) => {
    res.json({
        status: "ok",
        service: "bank-simulator",
        config: {
            successRate: SUCCESS_RATE,
            minDelayMs: MIN_DELAY_MS,
            maxDelayMs: MAX_DELAY_MS,
        },
        timestamp: new Date().toISOString(),
    });
});

/**
 * Root endpoint
 */
app.get("/", (_req, res) => {
    res.json({
        message: "Bank Simulator Service",
        version: "2.0.0",
        endpoints: {
            health: "GET /health",
            process: "POST /process",
        },
    });
});

/**
 * Process payment request
 * Simulates bank processing with random delay and success/failure
 */
interface ProcessRequest {
    paymentIntentId: string;
    amount: number;
    method: string;
    callbackUrl: string;
}

interface CallbackPayload {
    paymentIntentId: string;
    status: "succeeded" | "failed";
    processedAt: string;
    failureReason?: string;
    bankReference?: string;
}

app.post("/process", async (req, res) => {
    const { paymentIntentId, amount, method, callbackUrl } = req.body as ProcessRequest;

    // Validate required fields
    if (!paymentIntentId || !amount || !method || !callbackUrl) {
        return res.status(400).json({
            error: "Missing required fields: paymentIntentId, amount, method, callbackUrl",
        });
    }

    const estimatedDelay = getRandomDelay();

    console.log(`[Bank Simulator] Processing payment ${paymentIntentId}`);
    console.log(`  Amount: ${amount} paise`);
    console.log(`  Method: ${method}`);
    console.log(`  Estimated delay: ${estimatedDelay}ms`);

    // Return immediate acknowledgment
    res.json({
        received: true,
        paymentIntentId,
        estimatedDelayMs: estimatedDelay,
        message: "Payment is being processed",
    });

    // Process asynchronously
    setTimeout(async () => {
        const success = shouldSucceed();
        const processedAt = new Date().toISOString();

        const payload: CallbackPayload = {
            paymentIntentId,
            status: success ? "succeeded" : "failed",
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
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Bank-Simulator": "true",
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
});

/**
 * Get a random failure reason
 */
function getRandomFailureReason(): string {
    const reasons = [
        "Insufficient funds",
        "Card declined by issuer",
        "Transaction timeout",
        "Invalid card details",
        "Bank server unavailable",
        "Daily transaction limit exceeded",
        "Suspected fraud - transaction blocked",
    ];
    return reasons[Math.floor(Math.random() * reasons.length)] || "Unknown error";
}

app.listen(PORT, () => {
    console.log(`[Bank Simulator] Running on port ${PORT}`);
    console.log(`  Success Rate: ${SUCCESS_RATE * 100}%`);
    console.log(`  Delay Range: ${MIN_DELAY_MS}ms - ${MAX_DELAY_MS}ms`);
});