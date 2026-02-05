# QuickPay 💸

> **Educational Payment Gateway** - A Stripe/Razorpay-like payment system built for learning and portfolio demonstration.

![Next.js](https://img.shields.io/badge/Next.js-16.1-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-7.x-2D3748?logo=prisma)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.x-38B2AC?logo=tailwind-css)
![Turbo](https://img.shields.io/badge/Turborepo-2.7-EF4444?logo=turborepo)

![QuickPay Dashboard](Quickpay_dashboard.png)

---

## 🏗️ Architecture

```mermaid
graph TB
    subgraph "Frontend App"
        QP[QuickPay App :3000]
        subgraph "User Routes"
            UD[/user/dashboard]
            UT[/user/transfer]
            UP[/user/p2p]
            UTX[/user/transactions]
        end
        subgraph "Merchant Routes"
            MD[/merchant/dashboard]
            MT[/merchant/transactions]
            MS[/merchant/settings]
        end
    end
    
    subgraph "Backend Services"
        API[Payment Intent API]
        WS[Wallet Service]
        RL[Rate Limiter]
        BS[Bank Simulator - Internal]
    end
    
    subgraph "Database"
        DB[(PostgreSQL / NeonDB)]
    end
    
    QP --> API
    API --> RL
    API --> WS
    API --> BS
    BS -->|Webhook| API
    API --> DB
    WS --> DB
```

**Single Unified Application:**
- One codebase, one deployment
- Route-based role separation (`/user/*` and `/merchant/*`)
- Unified authentication with dual providers (user credentials + merchant credentials)
- Role-based middleware for route protection

---

## ✨ Features

### 🔐 Authentication & Authorization
- **Dual Authentication System**
  - User login: Phone + password (with auto-signup)
  - Merchant login: Phone + password
- **Role-Based Access Control**
  - JWT sessions with role detection (`user` | `merchant`)
  - Middleware route protection for `/user/*` and `/merchant/*`
  - Automatic redirects based on session role

### 💳 Payment Processing
- **Payment Intent Lifecycle**: Create → Confirm → Webhook → Settle
- **Idempotency Keys**: Prevent duplicate transactions
- **Simulated Bank Processing**: Configurable success rates and delays
- **Webhook-based Confirmations**: Async payment flow
- **Payment Methods**: Card, UPI, Net Banking (simulated)

### 💰 User Wallet System
- **Add Money**: Load wallet from "bank" (simulated)
- **P2P Transfers**: Send money between users
- **Transaction History**: Complete audit trail
- **Real-time Balance**: Atomic balance updates
- **Concurrent Transfer Protection**: Database-level locking

### 🏪 Merchant Dashboard
- **Revenue Analytics**: Daily/Weekly/Monthly stats
- **Transaction Monitoring**: View all payment intents
- **API Key Management**: Secure merchant authentication
- **Webhook Configuration**: Receive payment confirmations

### 🔒 Security & Reliability
- **Rate Limiting**: Per-user and per-API-key limits
- **API Key Authentication**: Secure merchant endpoints
- **Password Hashing**: bcrypt for credential security
- **Database Transactions**: Atomic operations for all money transfers
- **Error Recovery**: Rollback on payment failures

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL (or NeonDB account)
- pnpm (recommended) or npm

### 1. Clone & Install
```bash
git clone <your-repo-url>
cd QuickPay
npm install
```

### 2. Environment Setup
Create `.env` in the project root:
```env
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/quickpay"

# NextAuth
NEXTAUTH_SECRET="your-super-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Bank Simulator (internal API)
BANK_SIMULATOR_URL="http://localhost:3000/api/bank-simulator"
SUCCESS_RATE=0.8
MIN_DELAY_MS=2000
MAX_DELAY_MS=5000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_MAX_API_REQUESTS=1000
```

### 3. Database Setup
```bash
# Navigate to database package
cd packages/db

# Apply migrations
npx prisma migrate dev

# Seed test data
npx prisma db seed

# (Optional) Open Prisma Studio
npx prisma studio
```

### 4. Run Development Server
```bash
# From project root
cd apps/quickpay-app
npm run dev
```

Access the application:
- **User App**: http://localhost:3000/login
- **Merchant App**: http://localhost:3000/merchant/login

---

## 🧪 Test Credentials

### User Account
- Phone: `1111111111`
- Password: `password`
- Pre-loaded wallet: ₹10,000

### Merchant Account
- Phone: `3333333333`
- Password: `password`
- API Key: `test_api_key_123456789`

---

## 📁 Project Structure

```
QuickPay/
├── apps/
│   └── quickpay-app/              # Unified Next.js application
│       ├── app/
│       │   ├── login/             # User authentication
│       │   ├── user/              # User routes (/user/*)
│       │   │   ├── dashboard/
│       │   │   ├── transfer/
│       │   │   ├── p2p/
│       │   │   └── transactions/
│       │   ├── merchant/          # Merchant routes (/merchant/*)
│       │   │   ├── login/
│       │   │   ├── dashboard/
│       │   │   ├── transactions/
│       │   │   └── settings/
│       │   ├── checkout/          # Shared checkout flow
│       │   ├── api/               # Consolidated API routes
│       │   │   ├── auth/
│       │   │   ├── payment-intents/
│       │   │   ├── wallet/
│       │   │   ├── bank-simulator/
│       │   │   └── webhooks/
│       │   └── lib/               # Shared utilities
│       │       ├── auth.ts        # Unified authentication
│       │       ├── services/      # Business logic
│       │       └── validations/
│       ├── components/
│       │   ├── ui/                # shadcn/ui components
│       │   ├── user/              # User-specific components
│       │   └── merchant/          # Merchant-specific components
│       └── middleware.ts          # Role-based route protection
│
├── packages/
│   ├── db/                        # Prisma schema & client
│   │   ├── prisma/schema.prisma
│   │   └── prisma/seed.js
│   ├── ui/                        # Shared UI components (@repo/ui)
│   └── store/                     # Recoil state management
│
├── turbo.json                     # Turborepo configuration
└── package.json                   # Root dependencies
```

---

## 🛠️ Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Utility-first styling
- **shadcn/ui** - Beautiful component library
- **Recoil** - State management
- **NextAuth** - Authentication

### Backend
- **Next.js API Routes** - Serverless functions
- **Prisma 7** - ORM with type-safe queries
- **PostgreSQL / NeonDB** - Database
- **bcrypt** - Password hashing

### Monorepo
- **Turborepo** - Fast build system
- **pnpm workspaces** - Package management

---

## 🧭 API Documentation

### Authentication
All API routes require either:
- Session cookie (for user/merchant logged in via browser)
- `x-api-key` header (for merchant server-to-server calls)

### Payment Intent Endpoints

#### Create Payment Intent
```bash
POST /api/payment-intents
Headers:
  x-api-key: <merchant_api_key>
  idempotency-key: <unique_key>
Body:
  {
    "amount": 50000,          # Amount in smallest unit (paise)
    "currency": "INR",
    "userId": 1,
    "paymentMethod": "card",  # card | upi | netbanking
    "metadata": {}            # Optional
  }
```

#### Confirm Payment
```bash
POST /api/payment-intents/:id/confirm
Body:
  {
    "cardNumber": "4242424242424242",
    "cvv": "123",
    "expiry": "12/25"
  }
```

#### List Payment Intents (Merchant)
```bash
GET /api/payment-intents
Headers:
  x-api-key: <merchant_api_key>
Query:
  ?status=succeeded&limit=10
```

### Wallet Endpoints

#### Get Balance
```bash
GET /api/wallet/balance
# Returns: { balance: 1000000 }
```

#### Add Money
```bash
POST /api/wallet/transactions
Body:
  {
    "amount": 50000,
    "provider": "HDFC Bank"
  }
```

#### P2P Transfer
```bash
POST /api/user/p2p
Body:
  {
    "phone": "2222222222",
    "amount": 10000
  }
```

---

## 🧪 Running Tests

```bash
# Type checking
npm run type-check

# Build verification
cd apps/quickpay-app
npm run build

# Prisma validation
cd packages/db
npx prisma validate
```

---

## 🚢 Deployment

### Vercel (Recommended)

1. **Import Project**
   ```bash
   cd apps/quickpay-app
   vercel
   ```

2. **Environment Variables**
   Set in Vercel dashboard:
   - `DATABASE_URL` → Your NeonDB connection string
   - `NEXTAUTH_SECRET` → Generate with `openssl rand -base64 32`
   - `NEXTAUTH_URL` → Your production URL
   - All rate limit variables

3. **Deploy**
   ```bash
   vercel --prod
   ```

### Other Platforms
The app is a standard Next.js application and can be deployed to:
- Netlify
- Railway
- Render
- Any platform supporting Node.js 18+

---

## 🎯 Learning Outcomes

From building QuickPay, you'll understand:

1. **Payment Gateway Architecture**
   - Payment intent lifecycle
   - Webhook-based confirmations
   - Idempotency for financial transactions

2. **Full-Stack TypeScript**
   - Type-safe API routes
   - Prisma ORM with generated types
   - End-to-end type safety

3. **Authentication & Authorization**
   - Dual-role authentication systems
   - JWT sessions with NextAuth
   - Role-based middleware

4. **Database Design**
   - Transaction isolation
   - Concurrent update protection
   - Atomic money transfers

5. **Modern Next.js Patterns**
   - App Router with Server Components
   - Route-based code organization
   - Unified monolithic architecture

---

## 📝 License

MIT - Feel free to use for learning and portfolio projects!

---

## 🤝 Contributing

This is an educational project. Feel free to:
- Fork and experiment
- Submit PRs for improvements
- Use as a learning resource

---

## 👨‍💻 Author

Built as a learning project to understand payment gateway architecture and modern full-stack development.

---

**⚡ QuickPay - Learn by Building Real Systems**
