"use client";

import React from "react";
import { UserIcon } from "./ui/icons";

interface ScheduleHeaderProps {
  viewMode: "day" | "week";
  onViewModeChange?: (mode: "day" | "week") => void;
  lastUpdated?: string;
  isRefreshing?: boolean;
}

export function ScheduleHeader({
  viewMode,
  onViewModeChange,
  lastUpdated = "11:35",
  isRefreshing = false,
}: ScheduleHeaderProps) {
  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Left: Brand & View Switcher */}
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-800 text-sm font-bold text-white shadow-xs">
              BS
            </div>
            <span className="text-base font-bold tracking-tight text-zinc-900 sm:text-lg">
              Bright Smile Dental
            </span>
          </div>

          {/* Desktop Day / Week Switcher */}
          <div className="hidden sm:flex items-center rounded-lg bg-zinc-100 p-0.5 text-xs font-medium">
            <button
              type="button"
              onClick={() => onViewModeChange?.("day")}
              className={`rounded-md px-3 py-1.5 transition-all ${
                viewMode === "day"
                  ? "bg-teal-700 text-white shadow-xs"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              Day
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange?.("week")}
              className={`rounded-md px-3 py-1.5 transition-all ${
                viewMode === "week"
                  ? "bg-teal-700 text-white shadow-xs"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              Week
            </button>
          </div>
        </div>

        {/* Right: Refresh Status & Profile */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs text-zinc-500 font-medium">
            <span
              className={`inline-block h-2 w-2 rounded-full ${
                isRefreshing ? "bg-amber-500 animate-spin" : "bg-emerald-500"
              }`}
              aria-hidden="true"
            />
            <span className="hidden sm:inline">
              Updated {lastUpdated} · refreshes every minute
            </span>
            <span className="sm:hidden">
              Updated {lastUpdated}
            </span>
          </div>

          {/* User Sign out Form */}
          <form action="/api/auth/logout" method="post" className="flex items-center">
            <button
              type="submit"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
              title="Sign out of doctor portal"
              aria-label="Sign out"
            >
              <UserIcon size={18} />
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
