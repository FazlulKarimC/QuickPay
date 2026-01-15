# QuickPay Testing Guide

This guide covers manual testing procedures for verifying QuickPay functionality.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Test Accounts](#test-accounts)
- [Quick Verification](#quick-verification)
- [Manual Testing Flows](#manual-testing-flows)
- [Common Issues](#common-issues)

---

## Prerequisites

### 1. Database Setup

Ensure your database is running and migrated:

```powershell
cd packages/db
npx prisma migrate dev
npx prisma db seed
```

### 2. Start All Services

```powershell
cd c:\Users\FAZLUL\Desktop\MainProject\QuickPay
npm run dev
```

Verify all services are running:
- User App: http://localhost:3002
- Merchant App: http://localhost:3004
- Bank Simulator: http://localhost:3003

### 3. Verify Services

**Health Check - Bank Simulator:**
```powershell
Invoke-RestMethod -Uri "http://localhost:3003/health"
# Expected: { "status": "ok" }
```

---

## Test Accounts

After running `npx prisma db seed`, the following test accounts are available:

### Users

| Name | Phone | Password | Initial Balance |
|------|-------|----------|-----------------|
| Alice Test | 1111111111 | alice123 | ₹10,000.00 |
| Bob Test | 2222222222 | bob123 | ₹10,000.00 |

### Merchants

| Name | API Key |
|------|---------|
| Test Merchant | `test_api_key_123` |

---

## Quick Verification

### 1. Build Check

```powershell
npm run build
# Should complete with exit code 0
```

### 2. TypeScript Check

```powershell
cd apps/user-app
npx tsc --noEmit
# Should show no errors
```

### 3. API Health Check

```powershell
Invoke-RestMethod -Uri "http://localhost:3002/api/health"
# Expected: OK
```

---

## Manual Testing Flows

### Flow 1: Complete Payment Lifecycle

Test the full payment flow: Create → Confirm → Succeed/Fail → Refund

**Step 1: Create Payment Intent**
```powershell
$headers = @{
    "X-API-Key" = "test_api_key_123"
    "Content-Type" = "application/json"
}

$body = @{
    amount = 10000
    currency = "INR"
    metadata = @{
        orderId = "test_order_001"
    }
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:3002/api/payment-intents" `
    -Method POST -Headers $headers -Body $body

Write-Host "Payment Intent ID: $($response.id)"
Write-Host "Status: $($response.status)"
# Expected: status = "created"
```

**Step 2: Confirm Payment**
```powershell
$paymentId = $response.id
$confirmBody = @{ paymentMethod = "card" } | ConvertTo-Json

$confirmResponse = Invoke-RestMethod `
    -Uri "http://localhost:3002/api/payment-intents/$paymentId/confirm" `
    -Method POST -Headers $headers -Body $confirmBody

Write-Host "Status after confirm: $($confirmResponse.status)"
# Expected: status = "processing"
```

**Step 3: Wait for Bank Processing**
```powershell
# Wait 3-5 seconds for bank simulator to process
Start-Sleep -Seconds 5

$statusResponse = Invoke-RestMethod `
    -Uri "http://localhost:3002/api/payment-intents/$paymentId" `
    -Method GET -Headers $headers

Write-Host "Final Status: $($statusResponse.status)"
# Expected: status = "succeeded" (80% of time) or "failed" (20% of time)
```

**Step 4: Refund (if succeeded)**
```powershell
if ($statusResponse.status -eq "succeeded") {
    $refundResponse = Invoke-RestMethod `
        -Uri "http://localhost:3002/api/payment-intents/$paymentId/refund" `
        -Method POST -Headers $headers

    Write-Host "Refund Status: $($refundResponse.status)"
    # Expected: status = "refunded"
}
```

---

### Flow 2: Wallet Operations

**Step 1: Login to User App**
1. Open http://localhost:3002
2. Sign in with phone: `1111111111`, password: `alice123`

**Step 2: Check Balance**
```powershell
# After login, check wallet via API (requires session cookie)
# Or view in browser at Dashboard page
```

**Step 3: Verify Transaction History**
1. Navigate to Transactions page
2. Should show recent credits/debits
3. Each transaction should display type, amount, and date

---

### Flow 3: Rate Limiting

Test that rate limiting is working:

```powershell
# Send 110 requests rapidly
1..110 | ForEach-Object {
    try {
        $result = Invoke-RestMethod -Uri "http://localhost:3002/api/health"
        Write-Host "Request $_: OK"
    } catch {
        Write-Host "Request $_: Rate Limited (429)"
    }
}
# After ~100 requests, should start returning 429
```

---

### Flow 4: Idempotency

Test duplicate payment prevention:

```powershell
$idempotencyKey = [guid]::NewGuid().ToString()

$headers = @{
    "X-API-Key" = "test_api_key_123"
    "Content-Type" = "application/json"
    "Idempotency-Key" = $idempotencyKey
}

$body = @{ amount = 5000; currency = "INR" } | ConvertTo-Json

# First request
$response1 = Invoke-RestMethod -Uri "http://localhost:3002/api/payment-intents" `
    -Method POST -Headers $headers -Body $body

# Second request with same idempotency key
$response2 = Invoke-RestMethod -Uri "http://localhost:3002/api/payment-intents" `
    -Method POST -Headers $headers -Body $body

# Both should return the same payment intent ID
Write-Host "First ID: $($response1.id)"
Write-Host "Second ID: $($response2.id)"
# Expected: Both IDs are identical
```

---

### Flow 5: Cancel Payment

```powershell
$headers = @{
    "X-API-Key" = "test_api_key_123"
    "Content-Type" = "application/json"
}

# Create a new payment
$body = @{ amount = 3000; currency = "INR" } | ConvertTo-Json
$payment = Invoke-RestMethod -Uri "http://localhost:3002/api/payment-intents" `
    -Method POST -Headers $headers -Body $body

# Cancel it
$cancelResponse = Invoke-RestMethod `
    -Uri "http://localhost:3002/api/payment-intents/$($payment.id)/cancel" `
    -Method POST -Headers $headers

Write-Host "Status: $($cancelResponse.status)"
# Expected: status = "canceled"
```

---

### Flow 6: Merchant Dashboard

1. Open http://localhost:3004
2. Login (if authentication is configured)
3. Verify:
   - Dashboard shows stats cards (Revenue, Transaction Count, Success Rate)
   - Transactions table displays recent payments
   - Settings page shows API key (masked)

---

## Common Issues

### Issue: Database Connection Error

**Symptom:**
```
PrismaClientInitializationError: Can't reach database server
```

**Solution:**
1. Verify DATABASE_URL in `.env`
2. Check database is running
3. Run: `npx prisma generate`

---

### Issue: Port Already in Use

**Symptom:**
```
Error: listen EADDRINUSE: address already in use :::3002
```

**Solution:**
```powershell
# Find and kill the process
Get-NetTCPConnection -LocalPort 3002 | Select-Object OwningProcess
Stop-Process -Id <process_id>
```

---

### Issue: API Key Authentication Fails

**Symptom:**
```json
{ "error": { "code": "authentication_required" } }
```

**Solution:**
1. Verify the API key is correct: `test_api_key_123`
2. Check header is spelled correctly: `X-API-Key`
3. Ensure merchant exists in database: `npx prisma db seed`

---

### Issue: Wallet Not Updating After Payment

**Symptom:**
Payment shows `succeeded` but wallet balance unchanged.

**Solution:**
1. Check bank simulator is running on port 3003
2. Verify webhook URL is correct in bank simulator env
3. Check server logs for webhook errors

---

### Issue: Session Not Persisting

**Symptom:**
User keeps getting redirected to sign-in page.

**Solution:**
1. Verify NEXTAUTH_SECRET is set in `.env`
2. Check NEXTAUTH_URL matches your development URL
3. Clear browser cookies and try again

---

## Prisma Studio

For direct database inspection:

```powershell
cd packages/db
npx prisma studio
```

Opens a GUI at http://localhost:5555 to browse:
- Users and their wallets
- Payment intents and their statuses
- Wallet transactions
- Merchants and API keys

---

## Logs

Check terminal output for:
- `[Wallet] Credited X paise to user Y` - Successful wallet updates
- `[Bank Simulator] Processing payment...` - Bank processing
- `[Webhook] Received callback for pi_...` - Webhook received

---

## Summary Checklist

Before considering Phase 7 complete:

- [ ] User App loads without console errors
- [ ] Merchant App loads without console errors
- [ ] Complete payment lifecycle works (create → confirm → succeed → refund)
- [ ] Wallet balance updates correctly
- [ ] Rate limiting blocks after 100 requests
- [ ] Idempotency prevents duplicate charges
- [ ] All build commands pass without errors
