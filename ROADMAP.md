# QuickPay Payment Gateway - Development Roadmap

> **Project Type**: Educational Payment Gateway (Stripe/Razorpay-like)  
> **Estimated Duration**: 3-4 weeks  
> **Last Updated**: January 13, 2026  
> **Design Reference**: [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)

---

## Overview

This roadmap outlines the phased upgrade of QuickPay from a simple P2P transfer app into a full-featured educational payment gateway system with modern UI.

```
Phase 0 → Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5 → Phase 6 → Phase 7
 Setup    Schema    Core API   Payment   Bank Sim   Wallet    Frontend   Docs
```

---

## Phase 0: Project Setup & Cleanup
**Duration**: 1 day | **Priority**: Must

### 0.1 Backup & Reset
- [ ] Create git branch: `git checkout -b feature/payment-gateway`
- [ ] Backup current database (optional, we're starting fresh)
- [ ] Delete old migration files in `packages/db/prisma/migrations/`

### 0.2 Upgrade Dependencies
Run in project root:
```bash
# Update Next.js to latest (15.x)
npm install next@latest react@latest react-dom@latest --workspace=apps/user-app
npm install next@latest react@latest react-dom@latest --workspace=apps/merchant-app

# Update Prisma
npm install prisma@latest @prisma/client@latest --workspace=packages/db

# Update Tailwind CSS
npm install tailwindcss@latest postcss@latest autoprefixer@latest --workspace=apps/user-app
npm install tailwindcss@latest postcss@latest autoprefixer@latest --workspace=apps/merchant-app

# Update NextAuth
npm install next-auth@latest --workspace=apps/user-app

# Add new dependencies
npm install lucide-react --workspace=apps/user-app
npm install lucide-react --workspace=apps/merchant-app
npm install zod --workspace=apps/user-app

# Setup shadcn/ui in both apps
cd apps/user-app && npx shadcn-ui@latest init
npx shadcn-ui@latest add button card table tabs dialog badge input skeleton toast
cd ../merchant-app && npx shadcn-ui@latest init
npx shadcn-ui@latest add button card table tabs badge input skeleton

# Update root dependencies
npm install turbo@latest -D
```

### 0.3 Project Restructure
- [ ] Rename folder: `apps/bank-webhook` → `apps/bank-simulator`
- [ ] Update package name in `apps/bank-simulator/package.json`
- [ ] Update `turbo.json` if needed

### 0.4 Environment Setup
Create/update `.env` files:
```env
# Root .env
DATABASE_URL="postgresql://user:pass@localhost:5432/quickpay"
NEXTAUTH_SECRET="your-super-secret-key"
NEXTAUTH_URL="http://localhost:3000"
BANK_SIMULATOR_URL="http://localhost:3003"

# Rate limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_MAX_API_REQUESTS=1000
```

### 0.5 Verification
- [x] `npm install` completes without errors
- [x] `npm run dev` starts all services
- [x] No TypeScript errors on build

---

## Phase 1: Database Schema Redesign
**Duration**: 1-2 days | **Priority**: Must

### 1.1 Clear Existing Data
```bash
cd packages/db
npx prisma migrate reset --force  # Clears all data
```

### 1.2 Create New Schema
Replace `packages/db/prisma/schema.prisma` with new models:
- [x] `User` - existing + new relations
- [x] `Merchant` - add `apiKey` field
- [x] `PaymentIntent` - core payment model
- [x] `Wallet` - user balance
- [x] `WalletTransaction` - transaction history
- [x] `p2pTransfer` - keep existing
- [x] `RateLimitEntry` - rate limit tracking
- [x] All required enums

### 1.3 Run Migration
```bash
cd packages/db
npx prisma migrate dev --name init_payment_gateway
npx prisma generate
```

### 1.4 Create Seed Data
Create `packages/db/prisma/seed.ts`:
- [x] 2 test users with wallets (balance: ₹10,000 each)
- [x] 1 test merchant with API key
- [x] Sample payment intents (various statuses)

Add to `packages/db/package.json`:
```json
"prisma": {
  "seed": "ts-node prisma/seed.ts"
}
```

Run: `npx prisma db seed`

### 1.5 Verification
- [x] `npx prisma studio` shows all new tables
- [x] Seed data populates correctly
- [x] TypeScript types generated (`@prisma/client`)

---

## Phase 2: Core API Infrastructure
**Duration**: 2-3 days | **Priority**: Must

### 2.1 Rate Limiting
**File**: `apps/user-app/app/lib/rate-limit.ts`
- [x] Sliding window algorithm using `RateLimitEntry` table
- [x] `checkRateLimit(key: string, limit: number)` function
- [x] `cleanupOldEntries()` function

**File**: `apps/user-app/proxy.ts` (renamed from middleware.ts for Next.js 16)
- [x] Apply rate limit to `/api/*` routes
- [x] 100 requests/minute for public endpoints
- [x] 1000 requests/minute for authenticated API keys
- [x] Return `429 Too Many Requests` with `Retry-After` header

### 2.2 Idempotency Keys
**File**: `apps/user-app/app/lib/idempotency.ts`
- [x] Parse `Idempotency-Key` header
- [x] Check if payment intent with key exists
- [x] Return cached response if found
- [x] Store key on new payment creation
- [x] Key format: UUID v4

### 2.3 API Key Authentication
**File**: `apps/user-app/app/lib/api-auth.ts`
- [x] Parse `X-API-Key` header
- [x] Lookup merchant by API key
- [x] Return merchant object or null
- [x] `withApiAuth()` wrapper for API routes

### 2.4 Error Handling
**File**: `apps/user-app/app/lib/api-error.ts`
- [x] Custom `ApiError` class
- [x] Standard error response format:
```json
{
  "error": {
    "code": "rate_limit_exceeded",
    "message": "Too many requests",
    "details": {}
  }
}
```

### 2.5 Verification
```bash
# Test rate limiting (should get 429 after ~100 requests)
for i in {1..110}; do curl -s http://localhost:3000/api/health; done

# Test idempotency
curl -X POST http://localhost:3000/api/payment-intents \
  -H "Idempotency-Key: test-123" -d '{"amount": 1000}'
# Same request should return same ID
```


---

## Phase 3: Payment Intent API
**Duration**: 3-4 days | **Priority**: Must

### 3.1 Create Payment Intent
**File**: `apps/user-app/app/api/payment-intents/route.ts` (POST)
- [x] Accept: `amount`, `currency`, `metadata`
- [x] Support `Idempotency-Key` header
- [x] Generate `clientSecret` for frontend
- [x] Return: `{ id, clientSecret, status, amount, currency, createdAt }`

### 3.2 List Payment Intents
**File**: `apps/user-app/app/api/payment-intents/route.ts` (GET)
- [x] Filter by: `status`, `created` (date range), `limit`
- [x] Pagination with `starting_after` cursor
- [x] Return: `{ data: [...], hasMore }`

### 3.3 Get Single Payment Intent
**File**: `apps/user-app/app/api/payment-intents/[id]/route.ts` (GET)
- [x] Return full payment details
- [x] Include merchant info if applicable

### 3.4 Confirm Payment
**File**: `apps/user-app/app/api/payment-intents/[id]/confirm/route.ts` (POST)
- [x] Accept: `paymentMethod` (card/upi/netbanking)
- [x] Validate current status is `created`
- [x] Update status to `processing`
- [x] Send request to Bank Simulator
- [x] Return updated payment intent

### 3.5 Cancel Payment
**File**: `apps/user-app/app/api/payment-intents/[id]/cancel/route.ts` (POST)
- [x] Validate current status is `created`
- [x] Update status to `canceled`
- [x] Return updated payment intent

### 3.6 Refund Payment
**File**: `apps/user-app/app/api/payment-intents/[id]/refund/route.ts` (POST)
- [x] Validate current status is `succeeded`
- [x] Create reverse wallet transaction
- [x] Update status to `refunded`
- [x] Return updated payment intent

### 3.7 Payment Service
**File**: `apps/user-app/app/lib/services/payment.ts`
- [x] `createPaymentIntent(data)`
- [x] `confirmPayment(id, method)`
- [x] `cancelPayment(id)`
- [x] `refundPayment(id)`
- [x] `getPaymentIntent(id)`
- [x] `listPaymentIntents(filters)`

### 3.8 Verification
Test complete lifecycle:
```bash
# Create
PI=$(curl -X POST .../api/payment-intents -d '{"amount":1000}')
PI_ID=$(echo $PI | jq -r '.id')

# Confirm
curl -X POST .../api/payment-intents/$PI_ID/confirm -d '{"paymentMethod":"card"}'

# Wait for webhook, then refund
curl -X POST .../api/payment-intents/$PI_ID/refund
```

---

## Phase 4: Bank Simulator Service
**Duration**: 1-2 days | **Priority**: Must

### 4.1 Process Endpoint
**File**: `apps/bank-simulator/src/index.ts`
- [x] `POST /process` endpoint
- [x] Accept: `paymentIntentId`, `amount`, `method`, `callbackUrl`
- [x] Simulate processing delay (2-5 seconds random)
- [x] Random success/failure (80% success, configurable)
- [x] Call webhook on completion

### 4.2 Callback Payload
```typescript
{
  paymentIntentId: string;
  status: "succeeded" | "failed";
  processedAt: string;
  failureReason?: string;
  bankReference?: string;
}
```

### 4.3 Bank Webhook Handler
**File**: `apps/user-app/app/api/webhooks/bank/route.ts`
- [x] Receive callback from bank simulator
- [x] Update PaymentIntent status
- [x] On success: credit user's wallet
- [x] On failure: update failureReason
- [x] Log all webhook events

### 4.4 Configuration
**File**: `apps/bank-simulator/.env`
```env
SUCCESS_RATE=0.8
MIN_DELAY_MS=2000
MAX_DELAY_MS=5000
WEBHOOK_SECRET=your-webhook-secret
```

### 4.5 Verification
- [x] Payment processing takes 2-5 seconds
- [x] ~80% success rate over 10 attempts
- [x] Webhook updates payment status correctly
- [x] Wallet credited on success

---

## Phase 5: Wallet System
**Duration**: 2 days | **Priority**: Must

### 5.1 Wallet Service
**File**: `apps/user-app/app/lib/services/wallet.ts`
- [ ] `getOrCreateWallet(userId)` - auto-create if missing
- [ ] `creditWallet(userId, amount, reference, description)`
- [ ] `debitWallet(userId, amount, reference, description)` - throws if insufficient
- [ ] `getBalance(userId)`
- [ ] `getTransactions(userId, options)` - with pagination

### 5.2 Wallet API
**File**: `apps/user-app/app/api/wallet/route.ts`
- [ ] `GET /api/wallet` - get balance + recent transactions
- [ ] Return: `{ balance, recentTransactions: [...] }`

**File**: `apps/user-app/app/api/wallet/transactions/route.ts`
- [ ] `GET /api/wallet/transactions` - full history with pagination
- [ ] Filters: `type`, date range, `limit`

### 5.3 Integration Points
- [ ] Credit wallet on payment success (via webhook)
- [ ] Debit wallet on refund
- [ ] P2P transfers use wallet (update existing code)

### 5.4 Atomic Transactions
Use Prisma transactions to prevent race conditions:
```typescript
await prisma.$transaction(async (tx) => {
  // Lock wallet row
  // Check balance
  // Update balance
  // Create transaction record
});
```

### 5.5 Verification
- [ ] Balance updates in real-time after payment
- [ ] Transaction history shows all credits/debits
- [ ] Concurrent operations don't corrupt balance
- [ ] Insufficient balance throws error

---

## Phase 6: Frontend UI Overhaul
**Duration**: 4-5 days | **Priority**: Should

> 📚 **Reference**: [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) for colors, typography, and component styles

### 6.1 Setup
- [ ] Install Inter font (Google Fonts)
- [ ] Add CSS variables from design system to `globals.css`
- [ ] Install `lucide-react` for icons
- [ ] Create base component styles

### 6.2 Shared UI Components (shadcn/ui + custom)
**Location**: `packages/ui/src/` + `apps/*/components/`

Payment-specific components (from DESIGN_SYSTEM.md):
- [ ] `StatusBadge.tsx` - payment status with icon + animation
- [ ] `AmountDisplay.tsx` - formatted currency display (sm/md/lg/xl)
- [ ] `MerchantHeader.tsx` - logo + name + reference
- [ ] `PaymentSummary.tsx` - label/value rows for checkout
- [ ] `TransactionTable.tsx` - filterable table with hover states

Skeleton loaders:
- [ ] `TransactionListSkeleton.tsx` - shimmer loading for transaction list
- [ ] `DashboardCardSkeleton.tsx` - loading state for stats cards
- [ ] `WalletBalanceSkeleton.tsx` - loading state for wallet

Base shadcn/ui components (customized):
- [ ] Button - primary, secondary, ghost, success, error variants
- [ ] Card - base, glass variants
- [ ] Input - styled with focus ring
- [ ] Badge - using semantic color variables
- [ ] Table - fintech styling with hover states
- [ ] Tabs - for payment method selection
- [ ] Dialog - for confirmations
- [ ] Toast - notifications

### 6.3 User App - Checkout Flow
**Page**: `apps/user-app/app/checkout/[paymentIntentId]/page.tsx`
- [ ] Glass-morphism card design
- [ ] Payment amount display
- [ ] Payment method tabs (Card/UPI/Netbanking)
- [ ] Mock card form (number, expiry, CVV)
- [ ] UPI ID input
- [ ] Bank selector for netbanking
- [ ] Confirm payment button
- [ ] Loading state during processing

**Page**: `apps/user-app/app/checkout/success/page.tsx`
- [ ] Success animation (checkmark)
- [ ] Confetti effect (optional)
- [ ] Transaction details
- [ ] "Back to Dashboard" button

**Page**: `apps/user-app/app/checkout/failed/page.tsx`
- [ ] Error animation (X mark)
- [ ] Failure reason display
- [ ] "Try Again" button
- [ ] "Back to Dashboard" button

### 6.4 User App - Dashboard Upgrade
**Page**: `apps/user-app/app/(dashboard)/dashboard/page.tsx`
- [ ] Wallet balance card with gradient
- [ ] Quick action buttons (Send, Add Money, History)
- [ ] Recent transactions list
- [ ] Status badges for each transaction

**Components**:
- [ ] `WalletCard.tsx` - balance display with gradient background
- [ ] `QuickActions.tsx` - action button grid
- [ ] `TransactionList.tsx` - list with status badges
- [ ] `TransactionItem.tsx` - single transaction row

### 6.5 User App - Existing Pages Polish
- [ ] `/transfer` - update styling to match design system
- [ ] `/p2p` - update styling to match design system
- [ ] `/transactions` - add filters, better table design
- [ ] Appbar - modern navigation with user avatar

### 6.6 Merchant App - Dashboard
**Page**: `apps/merchant-app/app/dashboard/page.tsx`
- [ ] Stats cards: Total Revenue, Transaction Count, Success Rate
- [ ] Line chart: Last 7 days revenue (simple CSS/SVG chart)
- [ ] Recent transactions table

### 6.7 Merchant App - Transactions
**Page**: `apps/merchant-app/app/transactions/page.tsx`
- [ ] Filterable transactions table
- [ ] Date range picker
- [ ] Status filter dropdown
- [ ] Pagination
- [ ] Export to CSV (optional)

### 6.8 Merchant App - Settings
**Page**: `apps/merchant-app/app/settings/page.tsx`
- [ ] API key display (masked with reveal button)
- [ ] Regenerate API key button
- [ ] Webhook URL configuration

### 6.9 Animations & Polish
- [ ] Page transitions (fade in)
- [ ] Button hover effects
- [ ] Loading skeletons for async data
- [ ] Toast notifications for actions
- [ ] Focus states for accessibility

### 6.10 Responsive Design
- [ ] Mobile-first layouts
- [ ] Collapsible sidebar on mobile
- [ ] Touch-friendly buttons
- [ ] Horizontal scroll for tables on mobile

### 6.11 Verification
- [ ] All pages render without errors
- [ ] Responsive on mobile/tablet/desktop
- [ ] Animations are smooth (check for jank)
- [ ] Accessibility: keyboard navigation works
- [ ] Dark mode consistent across all pages

---

## Phase 7: Documentation & Polish
**Duration**: 1-2 days | **Priority**: Should

### 7.1 README Update
**File**: `README.md`
- [ ] Project description
- [ ] Architecture diagram (Mermaid)
- [ ] Tech stack badges
- [ ] Features list
- [ ] Setup instructions
- [ ] Environment variables
- [ ] Scripts reference
- [ ] Screenshots/GIF demo
- [ ] API documentation link
- [ ] Contributing guidelines
- [ ] License

### 7.2 API Documentation
**File**: `API.md`
- [ ] All endpoints documented
- [ ] Request/response examples
- [ ] Authentication section
- [ ] Rate limiting section
- [ ] Error codes
- [ ] Webhook events

### 7.3 Code Cleanup
- [ ] Remove deprecated `OnRampTransaction` code
- [ ] Remove old `Balance` references
- [ ] Add JSDoc comments to services
- [ ] Ensure consistent error handling
- [ ] Remove unused imports/files

### 7.4 Testing Documentation
**File**: `TESTING.md`
- [ ] How to run tests
- [ ] Test accounts/credentials
- [ ] Manual testing steps
- [ ] Common issues

### 7.5 Final Verification
- [ ] Fresh `git clone` + setup works
- [ ] All features work end-to-end
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] All documentation accurate

---

## Quick Reference

### Ports
| Service | Port |
|---------|------|
| User App | 3000 |
| Merchant App | 3001 |
| Bank Simulator | 3003 |

### Key Files
| Purpose | Path |
|---------|------|
| Prisma Schema | `packages/db/prisma/schema.prisma` |
| User App Routes | `apps/user-app/app/api/` |
| Design System | `DESIGN_SYSTEM.md` |
| Rate Limit | `apps/user-app/app/lib/rate-limit.ts` |
| Wallet Service | `apps/user-app/app/lib/services/wallet.ts` |

### Commands
```bash
# Development
npm run dev               # Start all services

# Database
cd packages/db
npx prisma migrate dev    # Run migrations
npx prisma studio         # Open Prisma Studio
npx prisma db seed        # Seed data

# Linting
npm run lint              # Lint all packages
```

---

## Success Criteria

- [ ] Complete payment flow: create → confirm → succeed/fail → refund
- [ ] Bank simulator provides realistic 2-5s delay
- [ ] Wallet balance updates correctly on all operations
- [ ] Rate limiting prevents API abuse (429 after 100 requests)
- [ ] Idempotency prevents duplicate charges
- [ ] Frontend is modern, responsive, and follows design system
- [ ] Documentation is comprehensive for portfolio
- [ ] Fresh clone setup works without issues

---

*Track your progress by checking off items as you complete each phase!*
