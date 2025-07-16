// app/api/auth/[...all]/route.ts
import { auth } from "@/lib/auth/auth";
import { toNextJsHandler } from "better-auth/next-js";

const handler = toNextJsHandler(auth);

export { handler as GET, handler as POST };
