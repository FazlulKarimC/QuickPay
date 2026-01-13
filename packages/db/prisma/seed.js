const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from root .env
const envPath = path.resolve(__dirname, '../../../.env');
dotenv.config({ path: envPath });

console.log("1. Environment loaded from:", envPath);
console.log("DATABASE_URL present:", !!process.env.DATABASE_URL);
if (process.env.DATABASE_URL) {
  console.log("DATABASE_URL length:", process.env.DATABASE_URL.length);
}


// Fix for NeonDB channel_binding issue
if (process.env.DATABASE_URL && process.env.DATABASE_URL.includes("channel_binding=require")) {
  console.log("⚠️  Removing channel_binding=require from DATABASE_URL for compatibility");
  process.env.DATABASE_URL = process.env.DATABASE_URL.replace("&channel_binding=require", "");
}

const prisma = new PrismaClient();

async function main() {
  console.log("2. Prisma Client initialized. Connecting...");
  await prisma.$connect();
  console.log("✅ Connected!");

  console.log("🧹 Cleaning up existing data...");
  // Clear dependent tables first to avoid foreign key constraints
  await prisma.rateLimitEntry.deleteMany();
  await prisma.walletTransaction.deleteMany();
  await prisma.p2pTransfer.deleteMany();
  await prisma.paymentIntent.deleteMany();
  await prisma.wallet.deleteMany();
  await prisma.merchant.deleteMany();
  await prisma.user.deleteMany();
  console.log("✅ Data cleared.");

  console.log("🌱 Starting seed...");

  const HASHED_PASSWORD = await bcrypt.hash("password", 10);

  // ==================== USERS & WALLETS ====================
  console.log("Creating Users and Wallets...");

  // Alice
  const alice = await prisma.user.create({
    data: {
      number: "1111111111",
      password: HASHED_PASSWORD,
      name: "Alice Johnson",
      email: "alice@example.com",
      wallet: {
        create: {
          balance: 1000000, // 10,000 INR
          transactions: {
            create: {
              type: "credit",
              amount: 1000000,
              reference: "SEED_INITIAL",
              description: "Initial wallet balance"
            }
          }
        }
      }
    }
  });

  // Bob
  const bob = await prisma.user.create({
    data: {
      number: "2222222222",
      password: HASHED_PASSWORD,
      name: "Bob Smith",
      email: "bob@example.com",
      wallet: {
        create: {
          balance: 500000, // 5,000 INR
          transactions: {
            create: {
              type: "credit",
              amount: 500000,
              reference: "SEED_INITIAL",
              description: "Initial wallet balance"
            }
          }
        }
      }
    }
  });

  console.log(`✅ Created users: ${alice.name}, ${bob.name}`);

  // ==================== MERCHANT ====================
  console.log("Creating Merchant...");

  const merchant = await prisma.merchant.create({
    data: {
      email: "store@testmerchant.com",
      name: "Super Store",
      auth_type: "Google",
      apiKey: "test_api_key_123456789",
      webhookUrl: "http://localhost:3001/api/webhooks/payment"
    }
  });

  console.log(`✅ Created merchant: ${merchant.name}`);

  // ==================== PAYMENT INTENTS ====================
  console.log("Creating Payment Intents...");

  // 1. Success Transaction (Alice -> Merchant)
  await prisma.paymentIntent.create({
    data: {
      amount: 50000, // 500 INR
      currency: "INR",
      status: "succeeded",
      paymentMethod: "card",
      clientSecret: "pi_success_secret_1",
      idempotencyKey: "idem_key_1",
      merchantId: merchant.id,
      userId: alice.id,
      processedAt: new Date(),
      metadata: { orderId: "ORDER_101", item: "Premium Plan" }
    }
  });

  // 2. Failed Transaction (Bob -> Merchant)
  await prisma.paymentIntent.create({
    data: {
      amount: 150000, // 1,500 INR
      currency: "INR",
      status: "failed",
      paymentMethod: "upi",
      clientSecret: "pi_failed_secret_2",
      idempotencyKey: "idem_key_2",
      merchantId: merchant.id,
      userId: bob.id,
      failureReason: "Insufficient funds",
      processedAt: new Date(),
      metadata: { orderId: "ORDER_102", item: "Gold Plan" }
    }
  });

  // 3. Created Transaction (Pending)
  await prisma.paymentIntent.create({
    data: {
      amount: 20000, // 200 INR
      currency: "INR",
      status: "created",
      clientSecret: "pi_pending_secret_3",
      merchantId: merchant.id,
      userId: alice.id,
      metadata: { orderId: "ORDER_103" }
    }
  });

  console.log(`✅ Created payment intents`);
  console.log("🎉 Seed execution finished successfully.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Seed failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });