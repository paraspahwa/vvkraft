import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "VideoForge AI — Generate Stunning Videos with AI",
    template: "%s | VideoForge AI",
  },
  description:
    "Create professional AI-generated videos in seconds. Choose your style, write your prompt, and let VideoForge bring your vision to life.",
  keywords: ["AI video generation", "text to video", "AI video creator", "Kling AI", "Fal AI"],
  openGraph: {
    type: "website",
    title: "VideoForge AI",
    description: "Create professional AI-generated videos in seconds.",
    siteName: "VideoForge AI",
  },
  twitter: {
    card: "summary_large_image",
    title: "VideoForge AI",
    description: "Create professional AI-generated videos in seconds.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="bg-primary text-white antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
