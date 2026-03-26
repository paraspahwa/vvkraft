"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import Link from "next/link";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[ErrorBoundary] Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const msg = this.state.error?.message ?? "";
      const isConfigError =
        msg.includes("auth") ||
        msg.includes("useAuth must be used within AuthProvider");

      return (
        <div className="flex min-h-screen items-center justify-center bg-primary px-4">
          <div className="max-w-md space-y-4 text-center">
            <h2 className="text-xl font-bold text-white">Something went wrong</h2>
            <p className="text-sm text-gray-400">
              {isConfigError
                ? "The app could not connect to its authentication service. Please check your configuration."
                : "An unexpected error occurred. Please try again."}
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => this.setState({ hasError: false, error: null })}
                className="rounded-lg bg-accent-400 px-4 py-2 text-sm font-medium text-white hover:bg-accent-500 transition-colors"
              >
                Try Again
              </button>
              <Link
                href="/"
                className="rounded-lg border border-surface-border px-4 py-2 text-sm font-medium text-white hover:bg-surface-hover transition-colors"
              >
                Go Home
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
