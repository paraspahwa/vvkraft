import { auth } from "./auth";
import { getUserById, createUser } from "./db";
import type { User } from "@videoforge/shared";

interface AuthContext {
  user: User | null;
  userId: string | null;
}

/**
 * Resolves a Better Auth session to a user context, auto-creating the
 * database user record on first login if it doesn't already exist.
 */
export async function getOrCreateUserFromSession(
  requestHeaders: Headers
): Promise<AuthContext> {
  try {
    const session = await auth.api.getSession({
      headers: requestHeaders,
    });

    if (!session?.user) {
      return { user: null, userId: null };
    }

    const userId = session.user.id;
    let user = await getUserById(userId);

    if (!user) {
      try {
        user = await createUser(userId, {
          email: session.user.email ?? "",
          displayName: session.user.name ?? null,
          photoURL: session.user.image ?? null,
        });
      } catch (createErr) {
        console.error(
          `[auth-context] Failed to auto-create user record for id=${userId}:`,
          createErr
        );
        return { user: null, userId };
      }
    }

    return { user, userId };
  } catch {
    return { user: null, userId: null };
  }
}
