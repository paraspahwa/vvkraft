import { adminAuth } from "./firebase-admin";
import { getUserById, createUser } from "./db";
import type { User } from "@videoforge/shared";

interface AuthContext {
  user: User | null;
  userId: string | null;
}

/**
 * Resolves a Firebase ID token to a user context, auto-creating the Firestore
 * user document on first login if it doesn't already exist.
 */
export async function getOrCreateUserFromToken(
  authHeader: string | null | undefined
): Promise<AuthContext> {
  if (!authHeader?.startsWith("Bearer ")) {
    return { user: null, userId: null };
  }

  const token = authHeader.slice(7);
  try {
    const decoded = await adminAuth.verifyIdToken(token);
    let user = await getUserById(decoded.uid);

    if (!user) {
      try {
        user = await createUser(decoded.uid, {
          email: decoded.email ?? "",
          displayName: decoded.name ?? null,
          photoURL: decoded.picture ?? null,
        });
      } catch (createErr) {
        console.error(
          `[auth-context] Failed to auto-create Firestore user document for uid=${decoded.uid}:`,
          createErr
        );
        // User is authenticated but document creation failed; protected procedures
        // will still reject them until the document is created successfully.
        return { user: null, userId: decoded.uid };
      }
    }

    return { user, userId: decoded.uid };
  } catch {
    return { user: null, userId: null };
  }
}
