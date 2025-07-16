// lib/auth.ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "@/lib/prisma";

export const auth = betterAuth({
  appName: "CS50 Blog",
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    requireEmailVerification: true,
    sendResetPasswordEmail: true,
  },

  emailVerification: {
    enabled: true,
    sendOnSignUp: false,
    autoSignInAfterVerification: false,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 jours
    updateAge: 60 * 60 * 24, // 1 jour
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes
    },
  },
  trustedOrigins: [
    "http://localhost:3000",
    "https://cs50-blog-online.vercel.app/",
  ],
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",

  // Configuration des callbacks pour personnaliser le comportement
  callbacks: {
    async signIn({
      user,
      account,
    }: {
      user: User;
      account?: { providerId?: string };
    }) {
      // Logique personnalisée lors de la connexion
      console.log(
        `User ${user.email} signed in with ${account?.providerId || "email"}`
      );
      return true;
    },
    async signUp({ user }: { user: User }) {
      // Logique personnalisée lors de l'inscription
      console.log(`New user registered: ${user.email}`);
      return true;
    },
  },
});

// Types pour TypeScript
export type Session = typeof auth.$Infer.Session;
// Define a minimal User type or import it from your model if available
export type User = {
  id: string;
  email: string;
  name?: string | null;
  // Add other user fields as needed
};
