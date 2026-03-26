// Firebase Admin SDK has been replaced by Supabase + Better Auth.
// This file is kept as a stub to prevent import errors during migration.
// Database operations use Supabase (see lib/supabase.ts and lib/db.ts).
// Authentication uses Better Auth (see lib/auth.ts).

import { supabase } from "./supabase";

// Re-export supabase as adminDb for backward compatibility with routers
// that haven't been fully migrated yet.
export const adminDb = supabase;
