import { initTRPC, TRPCError } from "@trpc/server";
import { type CreateNextContextOptions } from "@trpc/server/adapters/next";
import superjson from "superjson";
import { ZodError } from "zod";
import { getOrCreateUserFromToken } from "../lib/auth-context";
import type { User } from "@videoforge/shared";

// Context type available in all procedures
export interface Context {
  user: User | null;
  userId: string | null;
}

// Create context from request headers (Firebase ID token in Authorization header)
export async function createContext(opts: CreateNextContextOptions): Promise<Context> {
  return getOrCreateUserFromToken(opts.req.headers.authorization as string | undefined);
}

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;

// Middleware that enforces authentication
const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.userId || !ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "You must be logged in" });
  }
  return next({
    ctx: {
      userId: ctx.userId,
      user: ctx.user,
    },
  });
});

export const protectedProcedure = t.procedure.use(isAuthed);

// Admin-only middleware (checks user.tier === "studio" as a proxy for admin access)
// In production, replace with a dedicated admin role/claim in Firebase Auth.
const isAdmin = t.middleware(({ ctx, next }) => {
  if (!ctx.userId || !ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "You must be logged in" });
  }
  if (ctx.user.tier !== "studio") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({
    ctx: {
      userId: ctx.userId,
      user: ctx.user,
    },
  });
});

export const adminProcedure = t.procedure.use(isAdmin);
