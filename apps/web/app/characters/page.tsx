"use client";

import { useState } from "react";
import { Plus, User2, Zap } from "lucide-react";
import { Button, Card, CardContent, Skeleton } from "@videoforge/ui";
import { AppLayout } from "@/components/layout/app-layout";
import { Header } from "@/components/layout/header";
import { CharacterCard } from "@/components/character/character-card";
import { CreateCharacterDialog } from "@/components/character/create-character-dialog";
import { trpc } from "@/lib/trpc/client";
import Link from "next/link";

export default function CharactersPage() {
  const [showCreate, setShowCreate] = useState(false);
  const { data: characters, isLoading } = trpc.character.list.useQuery();
  const { data: user } = trpc.user.me.useQuery();

  const characterCount = characters?.length ?? 0;
  const freeLimit = user?.tier === "free" ? 3 : null;
  const atFreeLimit = freeLimit !== null && characterCount >= freeLimit;

  return (
    <AppLayout>
      <Header
        title="Characters"
        description="Manage AI characters for consistent video generation"
      />

      <div className="p-8 space-y-6">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-400">
            {characterCount} character{characterCount !== 1 ? "s" : ""}
            {freeLimit && ` · ${characterCount} / ${freeLimit} (free limit)`}
          </p>

          {atFreeLimit ? (
            <Link href="/pricing">
              <Button variant="outline" size="sm">
                <Zap className="h-3.5 w-3.5" />
                Upgrade for more
              </Button>
            </Link>
          ) : (
            <Button
              variant="gradient"
              size="sm"
              onClick={() => setShowCreate(true)}
            >
              <Plus className="h-4 w-4" />
              New Character
            </Button>
          )}
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <Skeleton className="aspect-video rounded-t-xl" />
                <CardContent className="p-4 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : characterCount === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <User2 className="h-16 w-16 text-gray-600 mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">No characters yet</h3>
            <p className="text-gray-400 mb-6 max-w-sm text-sm">
              Create a character with a reference image to maintain consistent appearances across
              multiple video generations.
            </p>
            <Button variant="gradient" onClick={() => setShowCreate(true)}>
              <Plus className="h-4 w-4" />
              Create Your First Character
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {characters!.map((character) => (
              <CharacterCard
                key={character.id}
                character={character}
                onDeleted={() => {}}
              />
            ))}

            {/* Add new card (inline shortcut) */}
            {!atFreeLimit && (
              <button
                onClick={() => setShowCreate(true)}
                className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-surface-border text-gray-500 hover:border-accent-400/40 hover:text-accent-400 transition-all aspect-square"
              >
                <Plus className="h-8 w-8" />
                <span className="text-sm font-medium">Add Character</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Create dialog */}
      {showCreate && (
        <CreateCharacterDialog
          onClose={() => setShowCreate(false)}
          onCreated={() => setShowCreate(false)}
        />
      )}
    </AppLayout>
  );
}
