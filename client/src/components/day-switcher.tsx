"use client";

import React, { useRef } from "react";
import { ChevronLeftIcon, ChevronRightIcon, CalendarIcon } from "./ui/icons";
import { shiftDate } from "@/lib/api";

interface DaySwitcherProps {
  currentDate: string;
  initialDate: string;
  onDateChange: (date: string) => void;
}

export function DaySwitcher({
  currentDate,
  initialDate,
  onDateChange,
}: DaySwitcherProps) {
  const dateInputRef = useRef<HTMLInputElement>(null);

  const isToday = currentDate === initialDate;
  const isYesterday = currentDate === shiftDate(initialDate, -1);
  const isTomorrow = currentDate === shiftDate(initialDate, 1);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Previous / Next Arrow buttons */}
      <div className="flex items-center rounded-xl border border-zinc-200 bg-white p-0.5 shadow-xs">
        <button
          type="button"
          onClick={() => onDateChange(shiftDate(currentDate, -1))}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
          aria-label="Previous day"
          title="Previous day"
        >
          <ChevronLeftIcon size={18} />
        </button>

        {/* Quick Nav: Yesterday, Today, Tomorrow */}
        <div className="flex items-center px-1">
          <button
            type="button"
            onClick={() => onDateChange(shiftDate(initialDate, -1))}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              isYesterday
                ? "bg-teal-700 text-white shadow-xs"
                : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
            }`}
          >
            Yesterday
          </button>
          <button
            type="button"
            onClick={() => onDateChange(initialDate)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              isToday
                ? "bg-teal-700 text-white shadow-xs"
                : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
            }`}
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => onDateChange(shiftDate(initialDate, 1))}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              isTomorrow
                ? "bg-teal-700 text-white shadow-xs"
                : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
            }`}
          >
            Tomorrow
          </button>
        </div>

        <button
          type="button"
          onClick={() => onDateChange(shiftDate(currentDate, 1))}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
          aria-label="Next day"
          title="Next day"
        >
          <ChevronRightIcon size={18} />
        </button>
      </div>

      {/* Date Picker Button with hidden native date input */}
      <div className="relative">
        <input
          ref={dateInputRef}
          type="date"
          value={currentDate}
          onChange={(e) => {
            if (e.target.value) onDateChange(e.target.value);
          }}
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
        />
        <button
          type="button"
          onClick={() => {
            if (dateInputRef.current) {
              if ("showPicker" in HTMLInputElement.prototype) {
                dateInputRef.current.showPicker();
              } else {
                dateInputRef.current.focus();
              }
            }
          }}
          className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-xs font-semibold text-zinc-700 shadow-xs hover:bg-zinc-50 hover:text-zinc-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
        >
          <CalendarIcon size={16} className="text-zinc-500" />
          <span className="hidden sm:inline">Pick a date</span>
        </button>
      </div>
    </div>
  );
}
