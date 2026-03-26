"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Film, Chrome } from "lucide-react";
import { Button, Input, Card, CardContent } from "@videoforge/ui";
import { useAuth } from "@/components/auth/auth-provider";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { signIn, signInWithGoogle } = useAuth();
  const router = useRouter();
  const [authError, setAuthError] = useState<string | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setAuthError(null);
    try {
      await signIn(data.email, data.password);
      router.push("/dashboard");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Sign in failed";
      setAuthError(message.includes("INVALID_PASSWORD") ? "Invalid email or password" : message);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setAuthError(null);
    try {
      await signInWithGoogle();
      router.push("/dashboard");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Google sign in failed";
      setAuthError(message);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-primary px-4">
      <div className="w-full max-w-md space-y-8 animate-fade-in">
        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-gradient shadow-accent-glow">
              <Film className="h-6 w-6 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white">Welcome back</h1>
          <p className="text-sm text-gray-400">Sign in to your VideoForge account</p>
        </div>

        <Card>
          <CardContent className="p-6 space-y-5">
            {/* Google sign in */}
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="w-full"
              onClick={handleGoogleSignIn}
              loading={isGoogleLoading}
            >
              <Chrome className="h-4 w-4" />
              Continue with Google
            </Button>

            <div className="relative flex items-center">
              <div className="flex-1 border-t border-surface-border" />
              <span className="mx-4 text-xs text-gray-500">or</span>
              <div className="flex-1 border-t border-surface-border" />
            </div>

            {/* Email/password form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                {...register("email")}
                error={errors.email?.message}
              />
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                {...register("password")}
                error={errors.password?.message}
              />

              {authError && (
                <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2">
                  <p className="text-sm text-red-400">{authError}</p>
                </div>
              )}

              <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
                Sign In
              </Button>
            </form>

            <p className="text-center text-sm text-gray-400">
              Don&apos;t have an account?{" "}
              <Link href="/auth/register" className="text-accent-400 hover:text-accent-300 transition-colors">
                Sign up free
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
