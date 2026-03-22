"use client";

import { Bell, Search } from "lucide-react";
import { trpc } from "@/lib/trpc/client";

interface HeaderProps {
  title: string;
  description?: string;
}

export function Header({ title, description }: HeaderProps) {
  const { data: user } = trpc.user.me.useQuery();

  return (
    <header className="border-b border-surface-border bg-surface-card/50 backdrop-blur-sm px-8 py-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{title}</h1>
          {description && <p className="mt-1 text-sm text-gray-400">{description}</p>}
        </div>
        <div className="flex items-center gap-4">
          <button className="rounded-lg border border-surface-border p-2 text-gray-400 hover:bg-surface-hover hover:text-white transition-colors">
            <Bell className="h-4 w-4" />
          </button>
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.displayName ?? "User"}
              className="h-8 w-8 rounded-full object-cover ring-2 ring-accent-400/20"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-gradient text-white text-sm font-bold">
              {(user?.displayName ?? user?.email ?? "U")[0]?.toUpperCase()}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
