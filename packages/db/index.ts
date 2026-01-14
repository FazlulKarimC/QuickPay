import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  return new PrismaClient()
}

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma: ReturnType<typeof prismaClientSingleton> = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

// Re-export PrismaClient and types for use in other packages
export { PrismaClient } from '@prisma/client'
export type { Merchant, PaymentIntent, User, Wallet, WalletTransaction, RateLimitEntry } from '@prisma/client'

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma
