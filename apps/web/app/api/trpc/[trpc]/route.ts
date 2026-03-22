import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@/server/routers/_app";
import { adminAuth } from "@/lib/firebase-admin";
import { getUserById } from "@/lib/db";
import type { NextRequest } from "next/server";

const handler = (req: NextRequest) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: async () => {
      const authHeader = req.headers.get("authorization");
      if (!authHeader?.startsWith("Bearer ")) {
        return { user: null, userId: null };
      }

      const token = authHeader.slice(7);
      try {
        const decoded = await adminAuth.verifyIdToken(token);
        const user = await getUserById(decoded.uid);
        return { user, userId: decoded.uid };
      } catch {
        return { user: null, userId: null };
      }
    },
    onError({ error, path }) {
      if (error.code === "INTERNAL_SERVER_ERROR") {
        console.error(`tRPC error on ${path}:`, error);
      }
    },
  });

export { handler as GET, handler as POST };
