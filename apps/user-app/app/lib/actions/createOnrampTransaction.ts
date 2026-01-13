"use server";

import prisma from "@repo/db/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth";

export async function createOnRampTransaction(provider: string, amount: number) {
    // Ideally the token should come from the banking provider (hdfc/axis)
    const session = await getServerSession(authOptions);
    if (!session?.user || !session.user?.id) {
        return {
            message: "Unauthenticated request"
        }
    }
    const token = (Math.random() * 1000).toString();
    const merchant = await prisma.merchant.findFirst();
    if (!merchant) {
        return {
            message: "Merchant not found"
        }
    }
    await prisma.paymentIntent.create({
        data: {
            merchantId: merchant.id,
            status: "processing", // lowercase enum
            clientSecret: token,
            amount: amount * 100,
            userId: Number(session?.user?.id),
            currency: "INR",
            paymentMethod: "card" // Default to card for this mock
        }
    });

    return {
        message: "Done"
    }
}
