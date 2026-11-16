"use client";

import React from "react";
import {
  CalendarIcon,
  MoonIcon,
  AlertTriangleIcon,
  RefreshCwIcon,
  ChevronRightIcon,
} from "./ui/icons";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

interface EmptyStateProps {
  date: string;
  onRefresh?: () => void;
}

export function EmptyState({ onRefresh }: EmptyStateProps) {
  return (
    <Card className="my-6 flex flex-col items-center justify-center p-8 text-center sm:p-12">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
        <CalendarIcon size={26} />
      </div>
      <h3 className="mt-4 text-xl font-bold tracking-tight text-zinc-900">
        No appointments yet
      </h3>
      <p className="mt-2 max-w-sm text-sm text-zinc-600 leading-relaxed">
        The whole day is free. New WhatsApp bookings show up here within a minute.
      </p>

      <div className="mt-6">
        <button
          type="button"
          onClick={onRefresh}
          className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-4 py-2 text-xs font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
        >
          <RefreshCwIcon size={14} className="text-zinc-500" />
          <span>Checking every 60 seconds</span>
        </button>
      </div>
    </Card>
  );
}

interface ClosedSundayStateProps {
  onGoToNextDay: () => void;
}

export function ClosedSundayState({ onGoToNextDay }: ClosedSundayStateProps) {
  return (
    <div className="my-6 space-y-4">
      <Card className="flex flex-col items-center justify-center p-8 text-center sm:p-12">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-600">
          <MoonIcon size={26} />
        </div>
        <h3 className="mt-4 text-2xl font-bold tracking-tight text-zinc-900">
          The clinic is closed on Sundays
        </h3>
        <p className="mt-2 max-w-sm text-sm text-zinc-600 leading-relaxed">
          The WhatsApp assistant doesn&apos;t offer Sunday slots, so nothing will be booked here.
        </p>
      </Card>

      {/* Next open day navigation card */}
      <div
        onClick={onGoToNextDay}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") onGoToNextDay();
        }}
        className="flex cursor-pointer items-center justify-between rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs hover:border-teal-300 hover:bg-teal-50/30 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
      >
        <div>
          <span className="text-[11px] font-bold tracking-wider uppercase text-teal-700">
            Next open day
          </span>
          <h4 className="mt-0.5 text-base font-bold text-zinc-900">
            Monday schedule
          </h4>
          <p className="mt-0.5 text-xs text-zinc-500">
            Opens at 09:00
          </p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
          <ChevronRightIcon size={20} />
        </div>
      </div>

      {/* Clinic hours table */}
      <Card className="p-5">
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
          Clinic Hours
        </h4>
        <dl className="mt-3 divide-y divide-zinc-100 text-sm">
          <div className="flex justify-between py-2">
            <dt className="text-zinc-600">Mon – Fri</dt>
            <dd className="font-semibold tabular-nums text-zinc-900">09:00 – 18:00</dd>
          </div>
          <div className="flex justify-between py-2">
            <dt className="text-zinc-600">Saturday</dt>
            <dd className="font-semibold tabular-nums text-zinc-900">10:00 – 14:00</dd>
          </div>
          <div className="flex justify-between py-2">
            <dt className="text-zinc-600">Sunday</dt>
            <dd className="font-semibold text-rose-600">Closed</dd>
          </div>
        </dl>
      </Card>
    </div>
  );
}

interface ErrorStateProps {
  error: string;
  onRetry: () => void;
}

export function ErrorState({ error, onRetry }: ErrorStateProps) {
  return (
    <Card className="my-6 flex flex-col items-center justify-center p-8 text-center sm:p-12 border-rose-200 bg-rose-50/30">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-800">
        <AlertTriangleIcon size={26} />
      </div>
      <h3 className="mt-4 text-xl font-bold tracking-tight text-zinc-900">
        Can&apos;t reach the calendar
      </h3>
      <p className="mt-2 max-w-sm text-sm text-zinc-600 leading-relaxed">
        Google Calendar didn&apos;t respond. Your bookings are safe, and the WhatsApp assistant keeps booking as usual.
      </p>
      {error ? (
        <p className="mt-1 text-xs text-rose-600 max-w-xs">{error}</p>
      ) : null}

      <div className="mt-6 flex flex-col sm:flex-row items-center gap-3 w-full max-w-xs">
        <Button
          type="button"
          variant="primary"
          size="md"
          className="w-full"
          onClick={onRetry}
        >
          <RefreshCwIcon size={16} />
          <span>Try again</span>
        </Button>
        <a
          href="https://calendar.google.com"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full"
        >
          <Button type="button" variant="outline" size="md" className="w-full">
            Open Google Calendar
          </Button>
        </a>
      </div>

      <p className="mt-4 text-xs text-zinc-400">
        Retrying on its own every 60 seconds
      </p>
    </Card>
  );
}

export function LoadingSkeleton() {
  return (
    <div className="my-6 space-y-4" role="status" aria-live="polite">
      <span className="sr-only">Loading appointments schedule...</span>
      {/* Top badges skeleton */}
      <div className="flex gap-2">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="h-7 w-24 animate-pulse rounded-full bg-zinc-200" />
        ))}
      </div>

      {/* Hero card skeleton */}
      <div className="h-44 w-full animate-pulse rounded-2xl bg-zinc-200" />

      {/* Schedule list skeleton */}
      <div className="space-y-3 pt-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-24 w-full animate-pulse rounded-xl bg-zinc-200" />
        ))}
      </div>
    </div>
  );
}
