"use client";

import React, { useSyncExternalStore } from "react";
import { WifiOffIcon } from "./ui/icons";

interface OfflineBannerProps {
  lastUpdated?: string;
  isCached?: boolean;
}

function subscribe(callback: () => void) {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

function getSnapshot() {
  return typeof navigator !== "undefined" ? !navigator.onLine : false;
}

function getServerSnapshot() {
  return false;
}

export function OfflineBanner({ lastUpdated, isCached = false }: OfflineBannerProps) {
  const isOffline = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (!isOffline && !isCached) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="mb-4 flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50/90 px-4 py-2.5 text-xs text-amber-900 shadow-xs"
    >
      <div className="flex items-center gap-2">
        <WifiOffIcon size={16} className="text-amber-700 shrink-0" />
        <span className="font-medium">
          {isOffline
            ? "You are currently offline."
            : "Network issue."}{" "}
          {lastUpdated
            ? `Showing cached schedule from ${lastUpdated}.`
            : "Showing cached schedule."}
        </span>
      </div>
      <span className="text-[11px] text-amber-700/80">Cached view</span>
    </div>
  );
}
