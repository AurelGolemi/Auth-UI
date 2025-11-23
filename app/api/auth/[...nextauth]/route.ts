import NextAuth, { type AuthOptions } from "next-auth";
import { authOptions } from "@/app/lib/auth";

const handler = NextAuth(authOptions as AuthOptions);

export { handler as GET, handler as POST };
