import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

if (!supabaseUrl && typeof window === "undefined") {
  console.warn(
    "[Supabase] Missing NEXT_PUBLIC_SUPABASE_URL. " +
      "Copy .env.example to .env.local and fill in your Supabase credentials."
  );
}

/**
 * Server-side Supabase client using the service role key.
 * Use this in server-side code (tRPC routers, API routes, lib/db.ts).
 * WARNING: This bypasses RLS — never expose to the client.
 */
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
});
