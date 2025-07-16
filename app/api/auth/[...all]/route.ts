// app/api/auth/[...all]/route.ts
import { auth } from "@/lib/auth/auth";
import { toNextJsHandler } from "better-auth/next-js";

// Correction : s'assurer que auth est bien configuré
const handler = toNextJsHandler(auth);

export { handler as GET, handler as POST };
