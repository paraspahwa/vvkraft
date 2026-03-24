"use client";

import Link from "next/link";
import {
  Film,
  ArrowRight,
  Wand2,
  Image,
  Video,
  User2,
  Globe,
  Mic,
  ArrowUpCircle,
  Clock,
  Zap,
  Scissors,
  Volume2,
  Camera,
} from "lucide-react";

/* ── Category navigation tabs ─────────────────────────────────────────── */
const NAV_CATEGORIES = [
  { label: "Generate", icon: Wand2, href: "/generate" },
  { label: "Gallery", icon: Image, href: "/gallery" },
  { label: "Characters", icon: User2, href: "/characters" },
  { label: "Upscale", icon: ArrowUpCircle, href: "/upscale" },
  { label: "Long Video", icon: Clock, href: "/generate/long-video", badge: "NEW" },
  { label: "Pricing", icon: Globe, href: "/pricing" },
];

/* ── Hero featured banners ─────────────────────────────────────────────── */
const HERO_BANNERS = [
  {
    id: "text-to-video",
    title: "Generate Cinematic Videos",
    subtitle: "Powered by Kling AI & WAN 2.2",
    cta: "Start Creating",
    ctaHref: "/generate",
    gradient: "from-accent-700/80 via-accent-500/60 to-transparent",
    bg: "bg-gradient-to-br from-[#1a0a3e] via-[#0f0a1e] to-primary",
    accent: "#6366F1",
  },
  {
    id: "characters",
    title: "Consistent AI Characters",
    subtitle: "Maintain character identity across every scene",
    cta: "Create Character",
    ctaHref: "/characters",
    gradient: "from-secondary-700/80 via-secondary-500/60 to-transparent",
    bg: "bg-gradient-to-br from-[#1e0a3e] via-[#120a2e] to-primary",
    accent: "#8B5CF6",
  },
  {
    id: "upscale",
    title: "Upscale to 4K",
    subtitle: "Enhance any video with AI super-resolution",
    cta: "Upscale Now",
    ctaHref: "/upscale",
    gradient: "from-blue-800/80 via-blue-600/60 to-transparent",
    bg: "bg-gradient-to-br from-[#071e3d] via-[#0a1628] to-primary",
    accent: "#3B82F6",
  },
];

/* ── Suite tool cards ──────────────────────────────────────────────────── */
const SUITE_TOOLS = [
  {
    id: "text-to-video",
    titlePrefix: "Text to",
    titleHighlight: "Video",
    description: "Generate videos from text prompts",
    icon: Wand2,
    href: "/generate",
    color: "#6366F1",
    thumb: { bg: "bg-gradient-to-br from-pink-600 to-purple-700", emoji: "🎬" },
  },
  {
    id: "image-to-video",
    titlePrefix: "Image to",
    titleHighlight: "Video",
    description: "Animate any image into a video clip",
    icon: Video,
    href: "/generate",
    color: "#6366F1",
    thumb: { bg: "bg-gradient-to-br from-blue-600 to-cyan-500", emoji: "🐰" },
  },
  {
    id: "long-video",
    titlePrefix: "Long",
    titleHighlight: "Video",
    description: "Generate multi-scene long-form videos",
    icon: Clock,
    href: "/generate/long-video",
    color: "#6366F1",
    badge: "NEW",
    thumb: { bg: "bg-gradient-to-br from-orange-500 to-red-600", emoji: "🎞️" },
  },
  {
    id: "motion-sync",
    titlePrefix: "Motion",
    titleHighlight: "Sync",
    description: "Sync motion to audio beats automatically",
    icon: Zap,
    href: "/generate",
    color: "#6366F1",
    thumb: { bg: "bg-gradient-to-br from-purple-600 to-pink-600", emoji: "🕺" },
  },
  {
    id: "upscale",
    titlePrefix: "Upscale",
    titleHighlight: "4K",
    description: "Upscale and enhance video quality",
    icon: ArrowUpCircle,
    href: "/upscale",
    color: "#6366F1",
    thumb: { bg: "bg-gradient-to-br from-rose-500 to-pink-600", emoji: "⬆️" },
  },
  {
    id: "edit-video",
    titlePrefix: "Edit",
    titleHighlight: "Video",
    description: "Modify or retake video segments",
    icon: Scissors,
    href: "/generate",
    color: "#6366F1",
    thumb: { bg: "bg-gradient-to-br from-sky-500 to-blue-600", emoji: "✂️" },
  },
  {
    id: "characters",
    titlePrefix: "Create",
    titleHighlight: "Character",
    description: "Consistent AI characters across videos",
    icon: User2,
    href: "/characters",
    color: "#6366F1",
    thumb: { bg: "bg-gradient-to-br from-green-500 to-emerald-600", emoji: "👤" },
  },
  {
    id: "voiceover",
    titlePrefix: "Voice",
    titleHighlight: "Over",
    description: "Generate natural-sounding voiceovers",
    icon: Volume2,
    href: "/generate",
    color: "#6366F1",
    thumb: { bg: "bg-gradient-to-br from-amber-500 to-orange-600", emoji: "🎙️" },
  },
  {
    id: "camera-angle",
    titlePrefix: "Camera",
    titleHighlight: "Angle",
    description: "Control camera movement and angles",
    icon: Camera,
    href: "/generate",
    color: "#6366F1",
    thumb: { bg: "bg-gradient-to-br from-indigo-500 to-violet-600", emoji: "📷" },
  },
  {
    id: "audio-sync",
    titlePrefix: "Audio",
    titleHighlight: "Sync",
    description: "Add and sync audio to your videos",
    icon: Mic,
    href: "/generate",
    color: "#6366F1",
    thumb: { bg: "bg-gradient-to-br from-teal-500 to-cyan-600", emoji: "🎵" },
  },
];

/* ════════════════════════════════════════════════════════════════════════ */

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* ── Navbar ─────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-[#0a0a0a]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-screen-xl items-center justify-between px-6 py-3">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-gradient">
              <Film className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold gradient-text">VideoForge</span>
          </Link>

          {/* Category tabs – center */}
          <div className="hidden md:flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-1.5">
            {NAV_CATEGORIES.map((cat) => (
              <Link
                key={cat.href}
                href={cat.href}
                className="relative flex items-center gap-1.5 rounded-full px-3 py-1 text-sm text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
              >
                <cat.icon className="h-3.5 w-3.5" />
                {cat.label}
                {cat.badge && (
                  <span className="ml-0.5 rounded-sm bg-accent-400 px-1 py-0.5 text-[9px] font-bold uppercase text-white leading-none">
                    {cat.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>

          {/* Auth actions */}
          <div className="flex items-center gap-3">
            <Link
              href="/pricing"
              className="hidden sm:block text-sm text-gray-400 hover:text-white transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="/auth/login"
              className="rounded-lg border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-white transition-colors hover:bg-white/10"
            >
              Login
            </Link>
            <Link
              href="/auth/register"
              className="flex items-center gap-1.5 rounded-lg bg-accent-gradient px-4 py-1.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
            >
              Start for Free
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero banners ───────────────────────────────────────────────── */}
      <section className="mx-auto max-w-screen-xl px-6 pt-8 pb-6">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[3fr_2fr_2fr]">
          {HERO_BANNERS.map((banner, i) => (
            <div
              key={banner.id}
              className={`relative overflow-hidden rounded-2xl ${banner.bg} border border-white/8 ${
                i === 0 ? "min-h-[220px] lg:min-h-[280px]" : "min-h-[180px] lg:min-h-[280px]"
              } flex flex-col justify-end p-6 group cursor-pointer`}
            >
              {/* Decorative glow blobs */}
              <div
                className="absolute inset-0 opacity-20 blur-3xl"
                style={{
                  background: `radial-gradient(circle at 30% 50%, ${banner.accent}55, transparent 70%)`,
                }}
              />

              {/* Content overlay */}
              <div className={`absolute inset-0 bg-gradient-to-t ${banner.gradient}`} />

              <div className="relative z-10 space-y-2">
                <p className="text-xs text-white/60">{banner.subtitle}</p>
                <h2 className="text-xl font-bold text-white lg:text-2xl">{banner.title}</h2>
                <Link
                  href={banner.ctaHref}
                  className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-white/10 border border-white/20 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm hover:bg-white/20 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  {banner.cta}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── VideoForge Suite ───────────────────────────────────────────── */}
      <section className="mx-auto max-w-screen-xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">
            VideoForge <span className="gradient-text">Suite</span>
          </h2>
          <Link
            href="/dashboard"
            className="flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors"
          >
            More
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
          {SUITE_TOOLS.map((tool) => (
            <Link
              key={tool.id}
              href={tool.href}
              className="group flex items-center gap-3 rounded-2xl border border-white/8 bg-white/3 p-3 transition-all hover:border-accent-400/40 hover:bg-white/6"
            >
              {/* Text side */}
              <div className="min-w-0 flex-1 space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-semibold leading-tight text-white">
                    <span className="text-gray-400">{tool.titlePrefix} </span>
                    <span style={{ color: tool.color }}>{tool.titleHighlight}</span>
                  </p>
                  {tool.badge && (
                    <span className="rounded-sm bg-accent-400 px-1 py-0.5 text-[8px] font-bold uppercase text-white leading-none">
                      {tool.badge}
                    </span>
                  )}
                </div>
                <p className="line-clamp-2 text-xs text-gray-500 leading-tight">{tool.description}</p>
              </div>

              {/* Thumbnail */}
              <div
                className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-xl text-2xl ${tool.thumb.bg} ring-1 ring-white/10 group-hover:ring-accent-400/30 transition-all`}
              >
                {tool.thumb.emoji}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── CTA strip ──────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-screen-xl px-6 py-10">
        <div className="relative overflow-hidden rounded-2xl border border-accent-400/20 bg-accent-400/5 px-8 py-10 text-center">
          <div className="absolute inset-0 flex items-center justify-center opacity-10 blur-3xl">
            <div className="h-64 w-64 rounded-full bg-accent-400" />
          </div>
          <div className="relative space-y-4">
            <h2 className="text-3xl font-bold text-white">
              Ready to create your first AI video?
            </h2>
            <p className="mx-auto max-w-xl text-gray-400">
              Join thousands of creators using VideoForge to bring their ideas to life — no credit
              card required.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                href="/auth/register"
                className="inline-flex items-center gap-2 rounded-xl bg-accent-gradient px-8 py-3 text-base font-semibold text-white hover:opacity-90 transition-all shadow-accent-glow"
              >
                Start Generating Free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-8 py-3 text-base font-medium text-white hover:bg-white/10 transition-all"
              >
                View Plans
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/5 px-6 py-8">
        <div className="mx-auto max-w-screen-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Film className="h-4 w-4 text-accent-400" />
            <span className="text-sm text-gray-400">VideoForge AI © 2025</span>
          </div>
          <div className="flex gap-6">
            {["Privacy", "Terms", "API Docs"].map((link) => (
              <a key={link} href="#" className="text-sm text-gray-500 hover:text-white transition-colors">
                {link}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
