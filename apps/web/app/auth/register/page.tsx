"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Film, Chrome, CheckCircle2 } from "lucide-react";
import { Button, Input, Card, CardContent } from "@videoforge/ui";
import { useAuth } from "@/components/auth/auth-provider";

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

const FREE_TIER_PERKS = [
  "3 free video generations per day",
  "Up to 5 second videos",
  "480p resolution",
  "No credit card required",
];

export default function RegisterPage() {
  const { signUp, signInWithGoogle } = useAuth();
  const router = useRouter();
  const [authError, setAuthError] = useState<string | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setAuthError(null);
    try {
      await signUp(data.email, data.password);
      router.push("/dashboard");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Registration failed";
      setAuthError(message.includes("already exists") ? "An account with this email already exists" : message);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
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
    <div className="flex min-h-screen bg-primary">
      {/* Left: Form */}
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-8 animate-fade-in">
          <div className="text-center space-y-2">
            <div className="flex justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-gradient shadow-accent-glow">
                <Film className="h-6 w-6 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white">Create your account</h1>
            <p className="text-sm text-gray-400">Start generating AI videos for free</p>
          </div>

          <Card>
            <CardContent className="p-6 space-y-5">
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
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                  {...register("password")}
                  error={errors.password?.message}
                />
                <Input
                  label="Confirm Password"
                  type="password"
                  placeholder="Repeat your password"
                  autoComplete="new-password"
                  {...register("confirmPassword")}
                  error={errors.confirmPassword?.message}
                />

                {authError && (
                  <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2">
                    <p className="text-sm text-red-400">{authError}</p>
                  </div>
                )}

                <Button type="submit" size="lg" variant="gradient" className="w-full" loading={isSubmitting}>
                  Create Free Account
                </Button>
              </form>

              <p className="text-center text-sm text-gray-400">
                Already have an account?{" "}
                <Link href="/auth/login" className="text-accent-400 hover:text-accent-300 transition-colors">
                  Sign in
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right: Perks panel */}
      <div className="hidden lg:flex flex-1 items-center justify-center bg-surface-card border-l border-surface-border px-12">
        <div className="max-w-md space-y-8">
          <div className="space-y-3">
            <h2 className="text-3xl font-bold text-white">Free tier includes</h2>
            <p className="text-gray-400">Everything you need to get started with AI video generation.</p>
          </div>
          <ul className="space-y-4">
            {FREE_TIER_PERKS.map((perk) => (
              <li key={perk} className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-accent-400 flex-shrink-0" />
                <span className="text-gray-300">{perk}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
