# QuickPay

Educational payment gateway project built with a Turborepo monorepo and a single Next.js app.

## What this project includes

- Dual auth flows with NextAuth (user + merchant credentials)
- Merchant payment-intent API (create, list, get, confirm, cancel, refund)
- Simulated bank processor + webhook callback flow
- User wallet APIs and dashboard flows
- P2P transfer server action
- Prisma + PostgreSQL data layer

## Tech stack

- Next.js 16 (App Router)
- TypeScript
- Prisma
- PostgreSQL
- NextAuth
- Tailwind CSS
- Turborepo workspaces

## Monorepo structure

```text
apps/
  quickpay-app/     # Main Next.js app
packages/
  db/               # Prisma schema, migrations, seed
  ui/               # Shared UI components
  store/            # Shared state package
```

## Prerequisites

- Node.js 18+
- npm 10+
- PostgreSQL (local or managed)

## Environment variables

Create a root `.env` file:

```env
DATABASE_URL="postgresql://user:pass@localhost:5432/quickpay"

NEXTAUTH_SECRET="replace-with-strong-secret"
NEXTAUTH_URL="http://localhost:3000"

# Bank simulator behavior
BANK_SUCCESS_RATE=0.8
BANK_MIN_DELAY_MS=2000
BANK_MAX_DELAY_MS=5000
ALLOWED_CALLBACK_DOMAINS=localhost:3000

# Rate-limit module settings
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_MAX_API_REQUESTS=1000
```

## Local setup

1. Install dependencies

```bash
npm install
```

2. Apply Prisma migrations

```bash
npx prisma migrate dev --schema packages/db/prisma/schema.prisma
```

3. Seed local data

```bash
npx prisma db seed --schema packages/db/prisma/schema.prisma
```

4. Start dev server

```bash
npm run dev
```

App runs at `http://localhost:3000`.

## Useful scripts

From repo root:

- `npm run dev` - run workspace dev tasks
- `npm run build` - build all workspaces
- `npm run lint` - lint all workspaces
- `npm run format` - format ts/tsx/md files

From `apps/quickpay-app`:

- `npm run dev` - Next dev on port 3000
- `npm run build` - production build
- `npm run start` - start production server
- `npm run lint` - app lint

## Seed test credentials

- User:
  - phone: `1111111111`
  - password: `password`
- Merchant:
  - phone: `3333333333`
  - password: `password`
  - API key (seeded merchant): `test_api_key_123456789`

## Key routes

- User app: `/login`, `/user/dashboard`, `/user/transfer`, `/user/p2p`, `/user/transactions`
- Merchant app: `/merchant/login`, `/merchant/dashboard`, `/merchant/transactions`, `/merchant/settings`
- Checkout: `/checkout/[paymentIntentId]`
- API base: `/api/*`

## API docs

See `API.md` for endpoint details, request/response formats, auth requirements, and examples.

## Deployment notes

- Set all required env vars in your host.
- Use a production PostgreSQL database.
- Ensure `NEXTAUTH_URL` points to the deployed URL.
- Use a strong `NEXTAUTH_SECRET` in production.
- Run `npm run lint` and `npm run build` in CI before deploy.
