import NextAuth, { type DefaultSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { loginSchema } from "@/lib/validators";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "ADMIN" | "LIBRARIAN" | "MEMBER";
    } & DefaultSession["user"];
  }

  interface User {
    role: "ADMIN" | "LIBRARIAN" | "MEMBER";
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) {
          return null;
        }

        const { email, password } = parsed.data;

        try {
          const [user] = await db
            .select()
            .from(users)
            .where(eq(users.email, email))
            .limit(1);

          if (!user || !user.isActive) {
            return null;
          }

          const isValid = await compare(password, user.passwordHash);
          if (!isValid) {
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            image: user.avatarUrl,
          };
        } catch (error) {
          // Fallback demo account authentication (zero-database deployment on Vercel)
          if (password === "demo1234!") {
            if (email === "admin@demo.com") {
              return {
                id: "d3m0-admin-0000-0000-000000000001",
                email: "admin@demo.com",
                name: "Admin User",
                role: "ADMIN" as const,
              };
            }
            if (email === "librarian@demo.com") {
              return {
                id: "d3m0-librarian-0000-0000-00000002",
                email: "librarian@demo.com",
                name: "Sarah the Librarian",
                role: "LIBRARIAN" as const,
              };
            }
            if (email === "member@demo.com") {
              return {
                id: "d3m0-member-0000-0000-000000000003",
                email: "member@demo.com",
                name: "Alex Reader",
                role: "MEMBER" as const,
              };
            }
          }
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "ADMIN" | "LIBRARIAN" | "MEMBER";
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
});
