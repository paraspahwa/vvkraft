"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ExternalLink, CreditCard, User, Bell } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button, Input } from "@videoforge/ui";
import { AppLayout } from "@/components/layout/app-layout";
import { Header } from "@/components/layout/header";
import { trpc } from "@/lib/trpc/client";
import { userProfileUpdateSchema, type UserProfileUpdateInput } from "@videoforge/shared";

export default function SettingsPage() {
  const { data: user, isLoading } = trpc.user.me.useQuery();
  const utils = trpc.useUtils();

  const updateProfileMutation = trpc.user.updateProfile.useMutation({
    onSuccess: () => void utils.user.me.invalidate(),
  });

  const portalMutation = trpc.billing.createPortalSession.useMutation({
    onSuccess: ({ url }) => { if (url) window.open(url, "_blank"); },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<UserProfileUpdateInput>({
    resolver: zodResolver(userProfileUpdateSchema),
    values: {
      displayName: user?.displayName ?? "",
    },
  });

  const onSubmit = async (data: UserProfileUpdateInput) => {
    await updateProfileMutation.mutateAsync(data);
  };

  if (isLoading) {
    return (
      <AppLayout>
        <Header title="Settings" />
        <div className="p-8 flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-400 border-t-transparent" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Header title="Settings" description="Manage your account and preferences" />

      <div className="p-8 max-w-2xl space-y-6">
        {/* Profile */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-accent-400" />
              <CardTitle className="text-base">Profile</CardTitle>
            </div>
            <CardDescription>Update your display name and profile information</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Display Name"
                placeholder="Your name"
                {...register("displayName")}
                error={errors.displayName?.message}
              />
              <Input
                label="Email"
                type="email"
                value={user?.email ?? ""}
                disabled
                helperText="Email cannot be changed"
              />
              <Button
                type="submit"
                disabled={!isDirty}
                loading={isSubmitting}
              >
                Save Changes
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Subscription */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-accent-400" />
              <CardTitle className="text-base">Subscription</CardTitle>
            </div>
            <CardDescription>Manage your subscription and billing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border border-surface-border bg-surface p-4">
              <div>
                <p className="text-sm font-medium text-white capitalize">{user?.tier} Plan</p>
                <p className="text-xs text-gray-400 mt-0.5">{user?.credits.toLocaleString()} credits remaining</p>
              </div>
              <div className="rounded-full bg-accent-400/10 px-3 py-1 text-xs font-medium text-accent-400 capitalize">
                {user?.tier}
              </div>
            </div>

            {user?.stripeCustomerId && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => portalMutation.mutate()}
                loading={portalMutation.isPending}
              >
                <ExternalLink className="h-4 w-4" />
                Manage Billing
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Danger zone */}
        <Card className="border-red-500/20">
          <CardHeader>
            <CardTitle className="text-base text-red-400">Danger Zone</CardTitle>
            <CardDescription>Irreversible actions for your account</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" className="w-full sm:w-auto">
              Delete Account
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
