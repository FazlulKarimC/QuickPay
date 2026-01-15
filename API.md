# QuickPay API Documentation

> Base URL: `http://localhost:3002/api`

---

## Table of Contents

- [Authentication](#authentication)
- [Rate Limiting](#rate-limiting)
- [Payment Intents](#payment-intents)
- [Wallet](#wallet)
- [Webhooks](#webhooks)
- [Error Handling](#error-handling)

---

## Authentication

QuickPay supports two authentication methods:

### 1. Session-Based (User App)

For browser-based requests, authentication is handled via NextAuth sessions. Users must be logged in to access protected endpoints.

### 2. API Key (Merchant API)

For server-to-server requests, use the `X-API-Key` header:

```http
X-API-Key: your_merchant_api_key
```

**Example:**
```bash
curl -X POST http://localhost:3002/api/payment-intents \
  -H "X-API-Key: test_api_key_123" \
  -H "Content-Type: application/json" \
  -d '{"amount": 10000, "currency": "INR"}'
```

---

## Rate Limiting

Rate limits are enforced using a sliding window algorithm:

| Endpoint Type | Rate Limit |
|--------------|------------|
| Public endpoints | 100 requests/minute |
| Authenticated (API Key) | 1000 requests/minute |

### Rate Limit Headers

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642000000
```

### Rate Limit Exceeded Response

```http
HTTP/1.1 429 Too Many Requests
Retry-After: 30
```

```json
{
  "error": {
    "code": "rate_limit_exceeded",
    "message": "Too many requests. Please retry after 30 seconds."
  }
}
```

---

## Payment Intents

Payment Intents represent a payment transaction lifecycle.

### Create Payment Intent

`POST /api/payment-intents`

Creates a new payment intent.

**Headers:**
- `X-API-Key` - Merchant API key
- `Idempotency-Key` - (Optional) UUID to prevent duplicate charges

**Request Body:**
```json
{
  "amount": 10000,
  "currency": "INR",
  "metadata": {
    "orderId": "order_123",
    "customerEmail": "customer@example.com"
  }
}
```

**Response (201 Created):**
```json
{
  "id": "pi_abc123xyz",
  "clientSecret": "pi_abc123xyz_secret_def456",
  "amount": 10000,
  "currency": "INR",
  "status": "created",
  "metadata": {
    "orderId": "order_123"
  },
  "createdAt": "2026-01-15T10:00:00.000Z"
}
```

---

### List Payment Intents

`GET /api/payment-intents`

Retrieves a list of payment intents.

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | string | Filter by status (created, processing, succeeded, failed, canceled, refunded) |
| `limit` | number | Maximum results (default: 10, max: 100) |
| `starting_after` | string | Cursor for pagination |

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "pi_abc123xyz",
      "amount": 10000,
      "currency": "INR",
      "status": "succeeded",
      "createdAt": "2026-01-15T10:00:00.000Z"
    }
  ],
  "hasMore": true
}
```

---

### Get Payment Intent

`GET /api/payment-intents/:id`

Retrieves a single payment intent by ID.

**Response (200 OK):**
```json
{
  "id": "pi_abc123xyz",
  "clientSecret": "pi_abc123xyz_secret_def456",
  "amount": 10000,
  "currency": "INR",
  "status": "succeeded",
  "metadata": {},
  "merchantId": "merchant_123",
  "createdAt": "2026-01-15T10:00:00.000Z",
  "updatedAt": "2026-01-15T10:05:00.000Z"
}
```

---

### Confirm Payment Intent

`POST /api/payment-intents/:id/confirm`

Confirms a payment intent and initiates processing.

**Request Body:**
```json
{
  "paymentMethod": "card"
}
```

**Supported Payment Methods:**
- `card` - Credit/Debit card
- `upi` - UPI payment
- `netbanking` - Net banking

**Response (200 OK):**
```json
{
  "id": "pi_abc123xyz",
  "status": "processing",
  "paymentMethod": "card",
  "updatedAt": "2026-01-15T10:01:00.000Z"
}
```

> **Note:** After confirmation, the Bank Simulator processes the payment asynchronously and sends a webhook callback.

---

### Cancel Payment Intent

`POST /api/payment-intents/:id/cancel`

Cancels a payment intent. Only `created` status payments can be canceled.

**Response (200 OK):**
```json
{
  "id": "pi_abc123xyz",
  "status": "canceled",
  "updatedAt": "2026-01-15T10:02:00.000Z"
}
```

---

### Refund Payment Intent

`POST /api/payment-intents/:id/refund`

Refunds a successful payment. Only `succeeded` status payments can be refunded.

**Response (200 OK):**
```json
{
  "id": "pi_abc123xyz",
  "status": "refunded",
  "updatedAt": "2026-01-15T10:10:00.000Z"
}
```

---

## Wallet

User wallet operations for balance and transactions.

### Get Wallet Balance

`GET /api/wallet`

Returns the current wallet balance and recent transactions.

**Response (200 OK):**
```json
{
  "balance": 1000000,
  "recentTransactions": [
    {
      "id": "tx_123",
      "type": "credit",
      "amount": 10000,
      "reference": "pi_abc123xyz",
      "description": "Payment received",
      "createdAt": "2026-01-15T10:05:00.000Z"
    }
  ]
}
```

> **Note:** Amounts are in paise (100 paise = ₹1)

---

### Get Transaction History

`GET /api/wallet/transactions`

Returns full transaction history with pagination.

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `type` | string | Filter by type (credit, debit) |
| `limit` | number | Maximum results (default: 20) |
| `starting_after` | string | Cursor for pagination |

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "tx_123",
      "type": "credit",
      "amount": 10000,
      "reference": "pi_abc123xyz",
      "description": "Payment received",
      "createdAt": "2026-01-15T10:05:00.000Z"
    }
  ],
  "hasMore": false
}
```

---

## Webhooks

### Bank Webhook

The Bank Simulator sends callbacks to notify payment completion.

**Endpoint:** `POST /api/webhooks/bank`

**Payload:**
```json
{
  "paymentIntentId": "pi_abc123xyz",
  "status": "succeeded",
  "processedAt": "2026-01-15T10:05:00.000Z",
  "bankReference": "BANK_REF_123"
}
```

**Failed Payment Payload:**
```json
{
  "paymentIntentId": "pi_abc123xyz",
  "status": "failed",
  "processedAt": "2026-01-15T10:05:00.000Z",
  "failureReason": "Insufficient funds"
}
```

### Webhook Events

| Event | Description |
|-------|-------------|
| `payment.succeeded` | Payment completed successfully, wallet credited |
| `payment.failed` | Payment failed, no wallet changes |

---

## Error Handling

### Standard Error Response

All errors follow a consistent format:

```json
{
  "error": {
    "code": "error_code",
    "message": "Human-readable error message",
    "details": {}
  }
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `validation_error` | 400 | Invalid request parameters |
| `authentication_required` | 401 | Missing or invalid authentication |
| `forbidden` | 403 | Insufficient permissions |
| `not_found` | 404 | Resource not found |
| `invalid_status` | 409 | Invalid state transition (e.g., confirming canceled payment) |
| `rate_limit_exceeded` | 429 | Too many requests |
| `insufficient_funds` | 400 | Wallet balance too low |
| `internal_error` | 500 | Server error |

### Example Error Responses

**Validation Error:**
```json
{
  "error": {
    "code": "validation_error",
    "message": "Invalid request parameters",
    "details": {
      "amount": "Amount must be greater than 0",
      "currency": "Currency must be INR"
    }
  }
}
```

**Invalid Status Transition:**
```json
{
  "error": {
    "code": "invalid_status",
    "message": "Cannot confirm a canceled payment intent",
    "details": {
      "currentStatus": "canceled",
      "requiredStatus": "created"
    }
  }
}
```

---

## Idempotency

To prevent duplicate charges, include an `Idempotency-Key` header with POST requests:

```http
Idempotency-Key: 550e8400-e29b-41d4-a716-446655440000
```

**Rules:**
- Keys must be valid UUID v4
- Keys are stored for 24 hours
- Duplicate requests within 24 hours return the original response
- Keys are scoped to the merchant

---

## SDK Examples

### Create and Confirm Payment (PowerShell)

```powershell
# Create a payment intent
$response = Invoke-RestMethod -Uri "http://localhost:3002/api/payment-intents" `
  -Method POST `
  -Headers @{"X-API-Key"="test_api_key_123"; "Content-Type"="application/json"} `
  -Body '{"amount": 10000, "currency": "INR"}'

$paymentId = $response.id

# Confirm the payment
Invoke-RestMethod -Uri "http://localhost:3002/api/payment-intents/$paymentId/confirm" `
  -Method POST `
  -Headers @{"X-API-Key"="test_api_key_123"; "Content-Type"="application/json"} `
  -Body '{"paymentMethod": "card"}'
```

### Create and Confirm Payment (cURL)

```bash
# Create a payment intent
PI=$(curl -s -X POST http://localhost:3002/api/payment-intents \
  -H "X-API-Key: test_api_key_123" \
  -H "Content-Type: application/json" \
  -d '{"amount": 10000, "currency": "INR"}')

PI_ID=$(echo $PI | jq -r '.id')

# Confirm the payment
curl -X POST http://localhost:3002/api/payment-intents/$PI_ID/confirm \
  -H "X-API-Key: test_api_key_123" \
  -H "Content-Type: application/json" \
  -d '{"paymentMethod": "card"}'
```

---

## Next Steps

- Check the [Testing Guide](./TESTING.md) for manual testing procedures
- Review the [Development Roadmap](./ROADMAP.md) for upcoming features
