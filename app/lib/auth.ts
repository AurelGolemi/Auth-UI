import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { compare, hash } from "bcrypt";
import { loginSchema } from "./validations/auth";

import { promises as fs } from "fs";
import path from "path";

// Path to JSON file storing users
const usersFilePath = path.join(process.cwd(), "data", "users.json");

// Helper function to read users from file
async function readUsersFromFile() {
  try {
    const data = await fs.readFile(usersFilePath, "utf-8");
    const usersArray = JSON.parse(data);
    // Convert array to Map with email keys
    const usersMap = new Map();
    for (const user of usersArray) {
      usersMap.set(user.email.toLowerCase(), {
        ...user,
        createdAt: new Date(user.createdAt),
      });
    }
    return usersMap;
  } catch (error) {
    // If file doesn't exist or error, return empty map
    return new Map();
  }
}

// Helper function to write users to file
async function writeUsersToFile(usersMap) {
  // Convert Map to array
  const usersArray = Array.from(usersMap.values());
  await fs.writeFile(usersFilePath, JSON.stringify(usersArray, null, 2));
}

// Helper function to get user by email
export async function getUserByEmail(email) {
  const users = await readUsersFromFile();
  return users.get(email.toLowerCase());
}

// Helper function to create user
export async function createUser(data) {
  const users = await readUsersFromFile();
  const email = data.email.toLowerCase();

  if (users.has(email)) {
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

  users.set(email, user);

  await writeUsersToFile(users);

  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
}

// Helper function to update password
export async function updateUserPassword(userId, newPassword) {
  const users = await readUsersFromFile();

  for (const [email, user] of users.entries()) {
    if (user.id === userId) {
      const hashedPassword = await hash(newPassword, 12);
      users.set(email, { ...user, password: hashedPassword });
      await writeUsersToFile(users);
      return true;
    }
  }
  throw new Error("User not found");
}

// NextAuth configuration
export const authOptions = {
  // Session strategy
  session: {
    strategy: "jwt", // Use JWT for stateless auth
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  // Custom pages
  pages: {
    signIn: "/login",
    error: "/login", // Redirect errors to login page
    verifyRequest: "/verify-request",
    newUser: "/profile", // Redirect new users after registration
  },

  // Authentication providers
  providers: [
    // Email/Password authentication
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          // Validate input format
          const validatedData = loginSchema.parse({
            email: credentials?.email,
            password: credentials?.password,
          });

          // Get user from storage
          const user = await getUserByEmail(validatedData.email);

          if (!user) {
            throw new Error("Invalid credentials");
          }

          // Verify password
          const isPasswordValid = await compare(
            validatedData.password,
            user.password
          );

          if (!isPasswordValid) {
            throw new Error("Invalid credentials");
          }

          // Return user object (without password)
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

    // Google OAuth
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

    // GitHub OAuth
    GitHubProvider({
      clientId: process.env.GITHUB_ID || "",
      clientSecret: process.env.GITHUB_SECRET || "",
    }),
  ],

  // Callbacks for customizing behavior
  callbacks: {
    // JWT callback - runs when JWT is created or updated
    async jwt({ token, user, account }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
      }

      // OAuth sign in
      if (account?.provider === "google" || account?.provider === "github") {
        // Check if user exists, create if not
        const existingUser = await getUserByEmail(token.email!);

        if (!existingUser) {
          // Create new user from OAuth data
          const newUser = await createUser({
            name: token.name!,
            email: token.email!,
            password: crypto.randomUUID(), // Random password for OAuth users
          });
          token.id = newUser.id;
        } else {
          token.id = existingUser.id;
        }
      }

      return token;
    },

    // Session callback - runs when session is checked
    async session({ session, token }) {
      if (session.user) {
        // Ensure token.id is a string, then assign to a narrowly-typed user object
        if (typeof token.id === "string") {
          (session.user as { id?: string }).id = token.id;
        }
      }
      return session;
    },

    // Redirect callback - controls where user goes after auth actions
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },

  // Security options
  secret: process.env.NEXTAUTH_SECRET,

  // Enable debug in development
  debug: process.env.NODE_ENV === "development",
};
