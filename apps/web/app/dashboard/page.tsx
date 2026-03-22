"use client";

import Link from "next/link";
import { Wand2, Image, Zap, TrendingUp, Clock, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Skeleton } from "@videoforge/ui";
import { AppLayout } from "@/components/layout/app-layout";
import { Header } from "@/components/layout/header";
import { trpc } from "@/lib/trpc/client";
import { VideoCard } from "@/components/gallery/video-card";
import { TIER_LIMITS } from "@videoforge/shared";

export default function DashboardPage() {
  const { data: user, isLoading: userLoading } = trpc.user.me.useQuery();
  const { data: stats } = trpc.user.stats.useQuery();
  const { data: generationsData, isLoading: generationsLoading } = trpc.generation.list.useQuery({
    limit: 6,
  });

  const recentGenerations = generationsData?.items ?? [];
  const limits = user ? TIER_LIMITS[user.tier] : null;

  return (
    <AppLayout>
      <Header
        title="Dashboard"
        description={user ? `Welcome back${user.displayName ? `, ${user.displayName}` : ""}` : ""}
      />

      <div className="p-8 space-y-8">
        {/* Stats row */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              label: "Credits",
              value: user?.credits ?? 0,
              icon: Zap,
              suffix: "",
              loading: userLoading,
            },
            {
              label: "Total Videos",
              value: stats?.totalGenerations ?? 0,
              icon: Image,
              suffix: "",
              loading: !stats,
            },
            {
              label: "This Month",
              value: stats?.generationsThisMonth ?? 0,
              icon: TrendingUp,
              suffix: limits?.videosPerMonth ? `/ ${limits.videosPerMonth}` : "",
              loading: !stats,
            },
            {
              label: "Plan",
              value: user?.tier ?? "free",
              icon: Clock,
              suffix: "",
              isString: true,
              loading: userLoading,
            },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs text-gray-400">{stat.label}</p>
                    {stat.loading ? (
                      <Skeleton className="h-7 w-20" />
                    ) : (
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-white capitalize">
                          {typeof stat.value === "number" ? stat.value.toLocaleString() : stat.value}
                        </span>
                        {stat.suffix && (
                          <span className="text-sm text-gray-500">{stat.suffix}</span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="rounded-lg bg-accent-400/10 p-2.5">
                    <stat.icon className="h-5 w-5 text-accent-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Link href="/generate">
            <Card className="hover:border-accent-400/50 hover:shadow-accent-glow cursor-pointer transition-all group">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-gradient shadow-accent-glow">
                  <Wand2 className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white">Generate Video</h3>
                  <p className="text-sm text-gray-400">Create a new AI video</p>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-500 group-hover:text-accent-400 transition-colors" />
              </CardContent>
            </Card>
          </Link>

          <Link href="/gallery">
            <Card className="hover:border-accent-400/50 cursor-pointer transition-all group">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary-500/10 border border-secondary-500/20">
                  <Image className="h-6 w-6 text-secondary-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white">View Gallery</h3>
                  <p className="text-sm text-gray-400">Browse your videos</p>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-500 group-hover:text-secondary-400 transition-colors" />
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Upgrade banner for free tier */}
        {user?.tier === "free" && (
          <div className="relative overflow-hidden rounded-xl border border-accent-400/20 bg-accent-400/5 p-6">
            <div className="absolute right-0 top-0 h-full w-1/3 bg-accent-gradient opacity-5" />
            <div className="relative flex items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="font-semibold text-white">Upgrade for more</h3>
                <p className="text-sm text-gray-400">
                  Get 50+ videos/month, 720p+ resolution, and no watermarks starting at $19/mo
                </p>
              </div>
              <Link href="/pricing">
                <Button variant="gradient" size="sm">
                  <Zap className="h-3.5 w-3.5" />
                  Upgrade
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Recent generations */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Recent Generations</h2>
            <Link href="/gallery">
              <Button variant="ghost" size="sm">
                View all
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>

          {generationsLoading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                  <Skeleton className="aspect-video rounded-t-xl" />
                  <CardContent className="p-4 space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : recentGenerations.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Wand2 className="mx-auto h-12 w-12 text-gray-600 mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No videos yet</h3>
                <p className="text-gray-400 mb-6 text-sm">
                  Create your first AI video to see it here
                </p>
                <Link href="/generate">
                  <Button variant="gradient">
                    <Wand2 className="h-4 w-4" />
                    Generate Your First Video
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {recentGenerations.map((generation) => (
                <VideoCard key={generation.id} generation={generation} />
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
