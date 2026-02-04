import GoogleProvider from "next-auth/providers/google";
import db from "@repo/db/client";
import { AuthType } from "@repo/db/client";
import type { AuthOptions } from "next-auth";

/**
 * Map OAuth provider string to Prisma AuthType enum
 */
function getAuthType(provider: string): AuthType {
  switch (provider.toLowerCase()) {
    case "google":
      return AuthType.Google;
    case "github":
      return AuthType.Github;
    default:
      // Default to Google for unknown providers (shouldn't happen in practice)
      console.warn(`[Auth] Unknown provider: ${provider}, defaulting to Google`);
      return AuthType.Google;
  }
}

// Get Google OAuth credentials with validation
// Uses empty strings for build-time but will fail at runtime with clear error
const googleClientId = process.env.GOOGLE_CLIENT_ID ?? "";
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET ?? "";

// Warn at startup if credentials are missing (will fail at runtime when Google auth is attempted)
if (!googleClientId || !googleClientSecret) {
  console.warn(
    "[Auth] WARNING: GOOGLE_CLIENT_ID and/or GOOGLE_CLIENT_SECRET are not set. " +
    "Google OAuth will fail at runtime."
  );
}

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // Runtime validation - fail fast with clear error
      if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
        console.error("[Auth] Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET environment variables");
        return false;
      }

      if (!user || !user.email || !account) {
        return false;
      }

      try {
        await db.merchant.upsert({
          where: {
            email: user.email,
          },
          create: {
            email: user.email,
            name: user.name,
            auth_type: getAuthType(account.provider),
          },
          update: {
            name: user.name,
            auth_type: getAuthType(account.provider),
          },
        });

        return true;
      } catch (error) {
        console.error("[Auth] Failed to upsert merchant:", {
          email: user.email,
          provider: account.provider,
          error: error instanceof Error ? error.message : String(error),
        });
        // Return false to deny sign-in on database error
        return false;
      }
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "secret",
};