import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "user" | "merchant";
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role?: "user" | "merchant";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: string;
    role?: "user" | "merchant";
  }
}
