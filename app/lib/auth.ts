import { NextAuthOptions, SessionStrategy } from "next-auth";
import type { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { compare, hash } from "bcrypt";
import { loginSchema } from "./validations/auth";
import crypto from "crypto";

// In-memory user store for serverless compatible usage
const usersMap = new Map<
  string,
  {
    id: string;
    name: string;
    email: string;
    password: string;
    createdAt: Date;
  }
>();

// Helper function to get user by email
export async function getUserByEmail(email: string) {
  return usersMap.get(email.toLowerCase());
}

// Helper function to create user
interface CreateUserData {
  name: string;
  email: string;
  password: string;
}
export async function createUser(data: CreateUserData) {
  const email = data.email.toLowerCase();

  if (usersMap.has(email)) {
    throw new Error("User already exists");
  }

  const hashedPassword = await hash(data.password, 12);
  const userId = crypto.randomUUID();

  const user = {
    id: userId,
    name: data.name,
    email,
    password: hashedPassword,
    createdAt: new Date(),
  };

  usersMap.set(email, user);

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
  };
}

// Helper function to update password
export async function updateUserPassword(
  userId: string,
  newPassword: string
): Promise<boolean> {
  for (const [email, user] of usersMap.entries()) {
    if (user.id === userId) {
      const hashedPassword = await hash(newPassword, 12);
      usersMap.set(email, { ...user, password: hashedPassword });
      return true;
    }
  }
  throw new Error("User not found");
}

// NextAuth configuration
export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt" as SessionStrategy,
    maxAge: 30 * 24 * 60 * 60,
  },

  pages: {
    signIn: "/login",
    error: "/login",
    verifyRequest: "/verify-request",
    newUser: "/profile",
  },

  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const validatedData = loginSchema.parse({
            email: credentials?.email,
            password: credentials?.password,
          });

          const user = await getUserByEmail(validatedData.email);
          if (!user) {
            throw new Error("Invalid credentials");
          }

          const isPasswordValid = await compare(
            validatedData.password,
            user.password
          );
          if (!isPasswordValid) {
            throw new Error("Invalid credentials");
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),

    GitHubProvider({
      clientId: process.env.GITHUB_ID || "",
      clientSecret: process.env.GITHUB_SECRET || "",
    }),
  ],

  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = (user as { id: string }).id;
      }

      if (
        account &&
        typeof account === "object" &&
        "provider" in account &&
        (account.provider === "google" || account.provider === "github")
      ) {
        const existingUser = await getUserByEmail(token.email!);
        if (!existingUser) {
          const newUser = await createUser({
            name: token.name!,
            email: token.email!,
            password: crypto.randomUUID(),
          });
          token.id = newUser.id;
        } else {
          token.id = existingUser.id;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && token && typeof token.id === "string") {
        (session.user as { id?: string }).id = token.id;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};
