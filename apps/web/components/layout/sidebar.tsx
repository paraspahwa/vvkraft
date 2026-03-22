"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Wand2,
  Image,
  DollarSign,
  Settings,
  LogOut,
  Zap,
  Film,
} from "lucide-react";
import { cn } from "@videoforge/ui";
import { useAuth } from "@/components/auth/auth-provider";
import { trpc } from "@/lib/trpc/client";
import { Badge } from "@videoforge/ui";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/generate", label: "Generate", icon: Wand2 },
  { href: "/gallery", label: "Gallery", icon: Image },
  { href: "/pricing", label: "Pricing", icon: DollarSign },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const { data: user } = trpc.user.me.useQuery();

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-surface-border bg-surface-card">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b border-surface-border px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-gradient">
          <Film className="h-4 w-4 text-white" />
        </div>
        <span className="text-lg font-bold gradient-text">VideoForge</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? "bg-accent-400/10 text-accent-400 border border-accent-400/20"
                  : "text-gray-400 hover:bg-surface-hover hover:text-white"
              )}
            >
              <item.icon className="h-4 w-4 flex-shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Credits & User */}
      <div className="border-t border-surface-border p-4 space-y-3">
        {user && (
          <div className="glass-card p-3 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">Credits</span>
              <Badge variant="secondary" className="text-xs">
                {user.tier}
              </Badge>
            </div>
            <div className="flex items-center gap-1">
              <Zap className="h-4 w-4 text-accent-400" />
              <span className="text-lg font-bold text-white">{user.credits.toLocaleString()}</span>
            </div>
          </div>
        )}

        <button
          onClick={() => void logout()}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-400 hover:bg-surface-hover hover:text-white transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
