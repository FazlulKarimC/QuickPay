# QuickPay API

Base URL (local): `http://localhost:3000/api`

## Authentication modes

### 1) Merchant API key auth

Used by payment-intent endpoints.

Header:

```http
X-API-Key: <merchant_api_key>
```

### 2) Session auth (NextAuth)

Used by user wallet/status endpoints. Requires logged-in user session cookie.

## Standard error format

Most endpoints use:

```json
{
  "error": {
    "code": "validation_error",
    "message": "Request validation failed",
    "details": {}
  }
}
```

Common error codes:

- `invalid_api_key`
- `unauthorized`
- `invalid_idempotency_key`
- `idempotency_key_in_use`
- `resource_not_found`
- `validation_error`
- `payment_failed`
- `insufficient_funds`
- `invalid_payment_status`
- `internal_error`

## Merchant payment-intent endpoints

### Create payment intent

`POST /payment-intents`

Auth: `X-API-Key`

Optional header:

```http
Idempotency-Key: <uuid-v4>
```

Body:

```json
{
  "amount": 10000,
  "currency": "INR",
  "metadata": {
    "orderId": "ORDER_1001"
  }
}
```

Notes:

- `amount` is integer paise.
- minimum amount is 100 paise.
- only `INR` is supported.
- with repeated idempotency key, API returns previous payment.

### List payment intents

`GET /payment-intents`

Auth: `X-API-Key`

Query params:

- `status`: `created | processing | succeeded | failed | canceled | refunded`
- `limit`: `1..100` (default `10`)
- `starting_after`: cursor id
- `created_gte`: ISO date string
- `created_lte`: ISO date string

Response shape:

```json
{
  "data": [],
  "hasMore": false
}
```

### Get payment intent

`GET /payment-intents/:id`

Auth: `X-API-Key`

### Confirm payment intent

`POST /payment-intents/:id/confirm`

Auth: `X-API-Key`

Body:

```json
{
  "paymentMethod": "card"
}
```

Allowed payment methods:

- `card`
- `upi`
- `netbanking`

Behavior:

- valid state transition is `created -> processing`
- API triggers bank simulator async flow and webhook callback

### Cancel payment intent

`POST /payment-intents/:id/cancel`

Auth: `X-API-Key`

Behavior:

- valid state transition is `created -> canceled`

### Refund payment intent

`POST /payment-intents/:id/refund`

Auth: `X-API-Key`

Behavior:

- valid state transition is `succeeded -> refunded`
- debits user wallet balance in transaction scope

## User/session endpoints

### Current session user

`GET /user`

Auth: NextAuth session.

### Payment status for logged-in user

`GET /user/payment-status/:id`

Auth: NextAuth session.

Behavior:

- returns 403 if payment does not belong to session user.

### Wallet summary

`GET /wallet`

Auth: NextAuth session.

Response shape:

```json
{
  "balance": 0,
  "recentTransactions": []
}
```

### Wallet transaction history

`GET /wallet/transactions`

Auth: NextAuth session.

Query params:

- `type`: `credit | debit | p2p_sent | p2p_received`
- `limit`: `1..100` (default `20`)
- `starting_after`: cursor id

Response shape:

```json
{
  "data": [],
  "hasMore": false
}
```

## Webhook endpoint

### Bank webhook receiver

`POST /webhooks/bank`

Used internally by bank-simulator service callback.

Success payload:

```json
{
  "paymentIntentId": "pi_xxx",
  "status": "succeeded",
  "processedAt": "2026-02-05T10:00:00.000Z",
  "bankReference": "BANK-ABC123"
}
```

Failure payload:

```json
{
  "paymentIntentId": "pi_xxx",
  "status": "failed",
  "processedAt": "2026-02-05T10:00:00.000Z",
  "failureReason": "Insufficient funds"
}
```

## Simulator and health endpoints

### App health

`GET /health`

### Bank simulator info

`GET /bank-simulator`

### Bank simulator health

`GET /bank-simulator/health`

### Bank simulator process (internal)

`POST /bank-simulator/process`

Body:

```json
{
  "paymentIntentId": "pi_xxx",
  "amount": 10000,
  "method": "card",
  "callbackUrl": "http://localhost:3000/api/webhooks/bank"
}
```

Notes:

- callback URL is validated for SSRF protections.
- in production, callback URL allowlist is controlled by `ALLOWED_CALLBACK_DOMAINS`.

## Quick curl examples

Create payment intent:

```bash
curl -X POST http://localhost:3000/api/payment-intents \
  -H "X-API-Key: test_api_key_123456789" \
  -H "Content-Type: application/json" \
  -d '{"amount":10000,"currency":"INR"}'
```

Confirm payment intent:

```bash
curl -X POST http://localhost:3000/api/payment-intents/<payment_intent_id>/confirm \
  -H "X-API-Key: test_api_key_123456789" \
  -H "Content-Type: application/json" \
  -d '{"paymentMethod":"card"}'
```
