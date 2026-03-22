"use client";

import { useState } from "react";
import { Trash2, User2, Film, Calendar } from "lucide-react";
import { Card, CardContent, Badge } from "@videoforge/ui";
import type { Character } from "@videoforge/shared";
import { trpc } from "@/lib/trpc/client";

interface CharacterCardProps {
  character: Character;
  onDeleted: (id: string) => void;
}

export function CharacterCard({ character, onDeleted }: CharacterCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const utils = trpc.useUtils();

  const deleteMutation = trpc.character.delete.useMutation({
    onSuccess: () => {
      void utils.character.list.invalidate();
      onDeleted(character.id);
    },
  });

  return (
    <Card className="group overflow-hidden transition-all hover:border-accent-400/30">
      {/* Reference image */}
      <div className="relative aspect-video bg-surface overflow-hidden">
        {character.referenceImageUrl ? (
          <img
            src={character.referenceImageUrl}
            alt={character.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <User2 className="h-10 w-10 text-gray-600" />
          </div>
        )}

        {/* Delete button */}
        {confirmDelete ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/70 p-4">
            <p className="text-xs text-white text-center font-medium">
              Delete this character?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmDelete(false)}
                className="rounded-lg border border-surface-border px-3 py-1.5 text-xs text-white hover:bg-surface-hover"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteMutation.mutate({ id: character.id })}
                disabled={deleteMutation.isPending}
                className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-600 disabled:opacity-50"
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            className="absolute right-2 top-2 rounded-lg bg-black/40 p-1.5 text-gray-400 opacity-0 group-hover:opacity-100 hover:bg-red-500/80 hover:text-white transition-all"
            title="Delete character"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Info */}
      <CardContent className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <p className="font-semibold text-white text-sm leading-tight">{character.name}</p>
          <Badge variant="secondary" className="shrink-0 text-xs">
            <Film className="mr-1 h-2.5 w-2.5" />
            {character.generationCount}
          </Badge>
        </div>

        {character.description && (
          <p className="text-xs text-gray-400 line-clamp-2">{character.description}</p>
        )}

        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Calendar className="h-3 w-3" />
          {new Date(character.createdAt).toLocaleDateString()}
        </div>
      </CardContent>
    </Card>
  );
}
