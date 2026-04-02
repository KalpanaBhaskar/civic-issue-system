import NextAuth from "next-auth/next";
import { authOptions } from "@/lib/auth";

// NextAuth types are sometimes too strict for custom session shape in JWT mode.
// Cast to avoid build-time type mismatches while keeping runtime behavior.
const handler = NextAuth(authOptions as never);

export { handler as GET, handler as POST };
