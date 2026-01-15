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
    subgraph "Frontend Apps"
        UA[User App :3002]
        MA[Merchant App :3004]
    end
    
    subgraph "Backend Services"
        API[Payment Intent API]
        WS[Wallet Service]
        RL[Rate Limiter]
    end
    
    subgraph "External"
        BS[Bank Simulator :3003]
    end
    
    subgraph "Database"
        DB[(PostgreSQL / NeonDB)]
    end
    
    UA --> API
    MA --> API
    API --> RL
    API --> WS
    API --> BS
    BS -->|Webhook| API
    API --> DB
    WS --> DB
```

---

## ✨ Features

### Payment Gateway Core
- **Payment Intent API** - Create, confirm, cancel, and refund payments
- **Idempotency Keys** - Prevent duplicate charges with UUID-based deduplication
- **Rate Limiting** - Sliding window algorithm (100 req/min public, 1000 req/min authenticated)
- **API Key Authentication** - Secure merchant API access with `X-API-Key` header

### Bank Simulator
- **Realistic Processing** - Configurable 2-5s random delays
- **Adjustable Success Rate** - Default 80% success, configurable via env
- **Webhook Callbacks** - Async notifications on payment completion

### Wallet System
- **Real-time Balance** - Atomic updates with Prisma transactions
- **Transaction History** - Full audit trail with pagination
- **P2P Transfers** - Send money between users

### Modern UI
- **Glassmorphism Design** - Premium glass effects and gradients
- **Dark Mode** - Full dark theme support
- **Responsive** - Mobile-first layouts
- **Animations** - Smooth transitions and micro-interactions

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL database (or [NeonDB](https://neon.tech) for serverless)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/quickpay.git
cd quickpay

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your database credentials

# Run database migrations
cd packages/db
npx prisma migrate dev
npx prisma db seed

# Start development servers
cd ../..
npm run dev
```

### Access the Apps

| App | URL | Description |
|-----|-----|-------------|
| User App | http://localhost:3002 | Consumer-facing wallet & payments |
| Merchant App | http://localhost:3004 | Merchant dashboard & API management |
| Bank Simulator | http://localhost:3003 | Simulated bank processing |

---

## 🔧 Environment Variables

Create a `.env` file in the project root:

```env
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/quickpay"

# NextAuth
NEXTAUTH_SECRET="your-super-secret-key"
NEXTAUTH_URL="http://localhost:3002"

# Bank Simulator
BANK_SIMULATOR_URL="http://localhost:3003"
SUCCESS_RATE=0.8
MIN_DELAY_MS=2000
MAX_DELAY_MS=5000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_MAX_API_REQUESTS=1000
```

---

## 📦 Project Structure

```
quickpay/
├── apps/
│   ├── user-app/          # Next.js 16 user-facing app
│   ├── merchant-app/      # Next.js 16 merchant dashboard
│   └── bank-simulator/    # Express.js bank simulation
├── packages/
│   ├── db/                # Prisma schema & client
│   ├── ui/                # Shared React components
│   └── store/             # State management (Recoil)
├── API.md                 # API documentation
├── TESTING.md             # Testing guide
└── ROADMAP.md             # Development roadmap
```

---

## 📚 Documentation

- **[API Documentation](./API.md)** - Complete API reference with examples
- **[Testing Guide](./TESTING.md)** - Manual testing steps and test accounts
- **[Development Roadmap](./ROADMAP.md)** - Feature development phases

---

## 🛠️ Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start all services in development mode |
| `npm run build` | Build all apps for production |
| `npm run lint` | Run ESLint across all packages |
| `npx prisma studio` | Open Prisma database GUI |
| `npx prisma db seed` | Seed database with test data |

---

## 🧪 Test Accounts

After seeding the database:

| User | Phone | Password |
|------|-------|----------|
| Test User 1 | 1111111111 | alice123 |
| Test User 2 | 2222222222 | bob123 |

| Merchant | API Key |
|----------|---------|
| Test Merchant | `test_api_key_123` |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📞 Contact

**Fazlul Karim** - [fazlul0127@gmail.com](mailto:fazlul0127@gmail.com)

---

**QuickPay** - Simplifying payments, one transaction at a time. 💰
