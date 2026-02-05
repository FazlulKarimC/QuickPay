import db from "@repo/db/client";
import { AuthType } from "@repo/db/client";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import type { AuthOptions } from "next-auth";

export const authOptions: AuthOptions = {
    providers: [
        // User Authentication (phone + password)
        CredentialsProvider({
            id: "user-credentials",
            name: "User Login",
            credentials: {
                phone: { label: "Phone number", type: "text", placeholder: "1231231231", required: true },
                password: { label: "Password", type: "password", required: true }
            },
            async authorize(credentials: any) {
                if (!credentials?.phone || !credentials?.password) {
                    return null;
                }

                const existingUser = await db.user.findFirst({
                    where: {
                        number: credentials.phone
                    }
                });

                if (existingUser) {
                    const passwordValidation = await bcrypt.compare(credentials.password, existingUser.password);
                    if (passwordValidation) {
                        return {
                            id: existingUser.id.toString(),
                            name: existingUser.name,
                            email: existingUser.number,
                            role: "user"
                        }
                    }
                    return null;
                }

                // Auto-create user if not exists (signup flow)
                try {
                    const hashedPassword = await bcrypt.hash(credentials.password, 10);
                    const user = await db.user.create({
                        data: {
                            number: credentials.phone,
                            password: hashedPassword
                        }
                    });

                    return {
                        id: user.id.toString(),
                        name: user.name,
                        email: user.number,
                        role: "user"
                    }
                } catch (e) {
                    console.error("[Auth] User creation failed:", e);
                    return null;
                }
            },
        }),

        // Merchant Authentication (phone + password)
        CredentialsProvider({
            id: "merchant-credentials",
            name: "Merchant Login",
            credentials: {
                phone: { label: "Phone number", type: "text", placeholder: "1231231231", required: true },
                password: { label: "Password", type: "password", required: true }
            },
            async authorize(credentials: any) {
                if (!credentials?.phone || !credentials?.password) {
                    return null;
                }

                const existingMerchant = await db.merchant.findFirst({
                    where: {
                        number: credentials.phone
                    }
                });

                if (existingMerchant) {
                    const passwordValidation = await bcrypt.compare(credentials.password, existingMerchant.password);
                    if (passwordValidation) {
                        return {
                            id: existingMerchant.id.toString(),
                            name: existingMerchant.name,
                            email: existingMerchant.number,
                            role: "merchant"
                        }
                    }
                    return null;
                }

                // Auto-create merchant if not exists (signup flow)
                try {
                    const hashedPassword = await bcrypt.hash(credentials.password, 10);
                    const merchant = await db.merchant.create({
                        data: {
                            number: credentials.phone,
                            password: hashedPassword,
                            auth_type: AuthType.Google // Default value
                        }
                    });

                    return {
                        id: merchant.id.toString(),
                        name: merchant.name,
                        email: merchant.number,
                        role: "merchant"
                    }
                } catch (e) {
                    console.error("[Auth] Merchant creation failed:", e);
                    return null;
                }
            },
        }),
    ],

    callbacks: {
        async jwt({ token, user }) {
            // Add role to token on sign-in
            if (user) {
                token.role = user.role || "user";
                token.userId = user.id;
            }
            return token;
        },

        async session({ session, token }: any) {
            // Add role and userId to session
            session.user.id = token.sub || token.userId;
            session.user.role = token.role || "user";
            return session;
        }
    },

    pages: {
        signIn: "/login", // Default to user login
    },

    secret: process.env.NEXTAUTH_SECRET || "secret",
};