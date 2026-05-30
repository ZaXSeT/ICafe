import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) return null;
          
          // Find user in database
          const user = await prisma.user.findUnique({
            where: { email: credentials.email as string },
          });

          if (!user) {
            console.log("Authorize failed: User not found");
            return null;
          }

          // Basic plain text comparison for MVP. In production, use bcrypt!
          // We will update this to bcrypt since we just installed it.
          const bcrypt = require("bcryptjs");
          const passwordsMatch = user.password && await bcrypt.compare(credentials.password as string, user.password);

          if (user && (passwordsMatch || user.password === credentials.password)) {
            // If password matches but email is not verified
            if (!user.emailVerified) {
              console.log("Authorize failed: Email not verified");
              const { CredentialsSignin } = require("next-auth");
              class UnverifiedEmailError extends CredentialsSignin {
                code = "unverified_email";
              }
              throw new UnverifiedEmailError();
            }

            return { id: user.id, name: user.name, email: user.email, role: user.role };
          }

          console.log("Authorize failed: Password mismatch");
          return null;
        } catch (error) {
          console.error("Authorize Error:", error);
          throw error;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        // @ts-expect-error
        session.user.role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});
