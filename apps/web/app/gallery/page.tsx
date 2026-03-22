"use client";

import { useState } from "react";
import { Image, Search, Filter } from "lucide-react";
import { AppLayout } from "@/components/layout/app-layout";
import { Header } from "@/components/layout/header";
import { VideoCard } from "@/components/gallery/video-card";
import { Card, CardContent, Skeleton, Button } from "@videoforge/ui";
import { trpc } from "@/lib/trpc/client";
import Link from "next/link";
import { Wand2 } from "lucide-react";

type StatusFilter = "all" | "completed" | "failed" | "processing";

export default function GalleryPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [cursor, setCursor] = useState<string | undefined>(undefined);

  const { data, isLoading, fetchNextPage, hasNextPage } = trpc.generation.list.useInfiniteQuery(
    { limit: 12 },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      initialCursor: undefined,
    }
  );

  const allGenerations = data?.pages.flatMap((page) => page.items) ?? [];
  const filtered = statusFilter === "all"
    ? allGenerations
    : allGenerations.filter((g) => g.status === statusFilter);

  const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
    { value: "all", label: "All" },
    { value: "completed", label: "Completed" },
    { value: "processing", label: "Processing" },
    { value: "failed", label: "Failed" },
  ];

  return (
    <AppLayout>
      <Header title="Gallery" description="Your AI-generated video collection" />

      <div className="p-8 space-y-6">
        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1 rounded-lg border border-surface-border bg-surface-card p-1">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                  statusFilter === f.value
                    ? "bg-accent-400 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i}>
                <Skeleton className="aspect-video rounded-t-xl" />
                <CardContent className="p-4 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Image className="h-16 w-16 text-gray-600 mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">
              {statusFilter === "all" ? "No videos yet" : `No ${statusFilter} videos`}
            </h3>
            <p className="text-gray-400 mb-6 max-w-xs">
              {statusFilter === "all"
                ? "Your generated videos will appear here once you start creating"
                : `You don't have any ${statusFilter} videos`}
            </p>
            {statusFilter === "all" && (
              <Link href="/generate">
                <Button variant="gradient">
                  <Wand2 className="h-4 w-4" />
                  Generate Your First Video
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((generation) => (
                <VideoCard key={generation.id} generation={generation} />
              ))}
            </div>

            {data?.pages[data.pages.length - 1]?.nextCursor && (
              <div className="flex justify-center pt-4">
                <Button
                  variant="outline"
                  onClick={() => void fetchNextPage()}
                >
                  Load More
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}
