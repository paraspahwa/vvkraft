import Link from "next/link";
import { ArrowRight, Zap, Shield, Wand2, Film, Star, Play } from "lucide-react";

const FEATURES = [
  {
    icon: Wand2,
    title: "Text-to-Video AI",
    description: "Transform your ideas into cinematic videos with a single prompt. Powered by Kling AI and WAN 2.2.",
  },
  {
    icon: Film,
    title: "Multiple Models",
    description: "Choose from cutting-edge AI models optimized for different use cases and quality levels.",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Priority queue for Pro & Studio users. Most videos ready in under 2 minutes.",
  },
  {
    icon: Shield,
    title: "Character Consistency",
    description: "Maintain consistent characters across multiple video generations with our AI system.",
  },
];

const TESTIMONIALS = [
  {
    name: "Sarah Chen",
    role: "Content Creator",
    avatar: "SC",
    text: "VideoForge has completely transformed my content workflow. I'm generating studio-quality videos in minutes.",
  },
  {
    name: "Marcus Rodriguez",
    role: "Marketing Director",
    avatar: "MR",
    text: "We've cut our video production costs by 80% using VideoForge. The quality is incredible.",
  },
  {
    name: "Aisha Johnson",
    role: "Indie Filmmaker",
    avatar: "AJ",
    text: "The Kling v3 model produces cinematic results that used to require a full production team.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-primary">
      {/* Nav */}
      <nav className="border-b border-surface-border bg-surface-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-gradient">
              <Film className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold gradient-text">VideoForge</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/pricing" className="text-sm text-gray-400 hover:text-white transition-colors">
              Pricing
            </Link>
            <Link
              href="/auth/login"
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/auth/register"
              className="rounded-lg bg-accent-gradient px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden px-6 py-24 text-center">
        {/* Glow effects */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-[600px] w-[600px] rounded-full bg-accent-400/5 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-4xl space-y-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 rounded-full border border-accent-400/20 bg-accent-400/5 px-4 py-1.5 text-sm text-accent-400">
            <Star className="h-3.5 w-3.5 fill-accent-400" />
            Powered by Kling AI & WAN 2.2
          </div>

          <h1 className="text-5xl font-bold leading-tight sm:text-6xl lg:text-7xl">
            Generate{" "}
            <span className="gradient-text">Cinematic Videos</span>
            <br />
            with AI
          </h1>

          <p className="mx-auto max-w-2xl text-lg text-gray-400 leading-relaxed">
            Turn your ideas into stunning videos in seconds. Professional quality AI video generation
            with advanced motion control, character consistency, and multiple model tiers.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/auth/register"
              className="flex items-center gap-2 rounded-xl bg-accent-gradient px-8 py-4 text-base font-semibold text-white hover:opacity-90 transition-all shadow-accent-glow"
            >
              Start Generating Free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/pricing"
              className="flex items-center gap-2 rounded-xl border border-surface-border bg-surface-card px-8 py-4 text-base font-medium text-white hover:border-accent-400/50 transition-all"
            >
              <Play className="h-4 w-4" />
              View Pricing
            </Link>
          </div>

          <p className="text-sm text-gray-500">No credit card required · 3 free videos/day</p>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Everything you need to{" "}
              <span className="gradient-text">create stunning videos</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="glass-card p-6 space-y-4 hover:border-accent-400/30 transition-all group"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-400/10 group-hover:bg-accent-400/20 transition-colors">
                  <feature.icon className="h-6 w-6 text-accent-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-6 py-20 bg-surface-card/30">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center text-3xl font-bold text-white mb-12">
            Loved by creators worldwide
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="glass-card p-6 space-y-4">
                <p className="text-gray-300 text-sm leading-relaxed">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-gradient text-white text-sm font-bold">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-24 text-center">
        <div className="mx-auto max-w-2xl space-y-6">
          <h2 className="text-4xl font-bold text-white">
            Ready to create your first AI video?
          </h2>
          <p className="text-gray-400">
            Join thousands of creators using VideoForge to bring their ideas to life.
          </p>
          <Link
            href="/auth/register"
            className="inline-flex items-center gap-2 rounded-xl bg-accent-gradient px-8 py-4 text-base font-semibold text-white hover:opacity-90 transition-all shadow-accent-glow"
          >
            Get Started Free
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-surface-border px-6 py-8">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Film className="h-4 w-4 text-accent-400" />
            <span className="text-sm text-gray-400">VideoForge AI © 2024</span>
          </div>
          <div className="flex gap-6">
            {["Privacy", "Terms", "API"].map((link) => (
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
