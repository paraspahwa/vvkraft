"use client";

import { createContext, useContext, type ReactNode } from "react";
import { authClient } from "@/lib/auth-client";

interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  image?: string | null | undefined;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, isPending } = authClient.useSession();

  const signIn = async (email: string, password: string) => {
    const { error } = await authClient.signIn.email({ email, password });
    if (error) throw new Error(error.message ?? "Sign in failed");
  };

  const signUp = async (email: string, password: string, name?: string) => {
    const { error } = await authClient.signUp.email({
      email,
      password,
      name: name || email.split("@")[0] || "",
    });
    if (error) throw new Error(error.message ?? "Sign up failed");
  };

  const signInWithGoogle = async () => {
    await authClient.signIn.social({ provider: "google" });
  };

  const logout = async () => {
    await authClient.signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        user: session?.user ?? null,
        loading: isPending,
        signIn,
        signUp,
        signInWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
