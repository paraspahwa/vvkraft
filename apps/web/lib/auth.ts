import { betterAuth } from "better-auth";
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl && typeof window === "undefined") {
  console.warn(
    "[auth] DATABASE_URL is not set. Better Auth will not function until a database URL is configured. " +
      "Copy .env.example to .env.local and fill in your Supabase DATABASE_URL."
  );
}

export const auth = betterAuth({
  database: databaseUrl
    ? new Pool({ connectionString: databaseUrl })
    : (undefined as unknown as Pool),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    },
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },
});
