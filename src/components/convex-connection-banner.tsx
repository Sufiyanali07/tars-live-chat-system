"use client";

import { useConvexConnectionState } from "convex/react";
import { useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";

export function ConvexConnectionBanner() {
  const connectionState = useConvexConnectionState();
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    if (!connectionState.isWebSocketConnected) {
      const t = setTimeout(() => setShowBanner(true), 3000);
      return () => clearTimeout(t);
    }
    setShowBanner(false);
  }, [connectionState.isWebSocketConnected]);

  if (!showBanner || connectionState.isWebSocketConnected) return null;

  const url = process.env.NEXT_PUBLIC_CONVEX_URL ?? "";
  const isLocalhost =
    !url || url.includes("127.0.0.1") || url.includes("localhost");

  return (
    <div
      role="alert"
      className="flex items-start gap-2 rounded-lg border border-amber-500/50 bg-amber-500/10 px-3 py-2.5 text-sm text-amber-800 dark:text-amber-200"
    >
      <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
      <div>
        <p className="font-medium">Can&apos;t connect to Convex</p>
        <p className="mt-0.5 text-xs opacity-90">
          {isLocalhost
            ? "Set NEXT_PUBLIC_CONVEX_URL in .env.local to your Convex cloud URL (e.g. https://xxx.convex.cloud). Get it from the Convex dashboard or run: npx convex dev"
            : "Check NEXT_PUBLIC_CONVEX_URL and run npx convex dev for local dev (or use your production Convex URL)."}
        </p>
      </div>
    </div>
  );
}
