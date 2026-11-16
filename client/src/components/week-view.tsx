"use client";

import React from "react";
import type { Appointment } from "@/lib/api";
import {
  formatDayMonth,
  getDayAbbr,
  formatTime,
  isSundayDate,
  isSaturdayDate,
  shiftDate,
  getMondayOfWeek,
  getWeekDays,
  formatWeekHeading,
} from "@/lib/api";
import { ServiceChip, ServiceDot } from "./ui/service-chip";
import { ChevronLeftIcon, ChevronRightIcon } from "./ui/icons";

interface WeekViewProps {
  currentDate: string;
  initialDate: string;
  timeZone: string;
  appointmentsByDate: Record<string, Appointment[]>;
  isLoading?: boolean;
  onSelectDay: (date: string) => void;
  onSelectAppointment: (appointment: Appointment) => void;
  onWeekChange: (newDate: string) => void;
}

export function WeekView({
  currentDate,
  initialDate,
  timeZone,
  appointmentsByDate,
  isLoading = false,
  onSelectDay,
  onSelectAppointment,
  onWeekChange,
}: WeekViewProps) {
  const currentMonday = getMondayOfWeek(currentDate);
  const initialMonday = getMondayOfWeek(initialDate);
  const weekDays = getWeekDays(currentMonday);
  const weekSunday = weekDays[6] || shiftDate(currentMonday, 6);

  // Calculate total appointments for this week
  const totalWeeklyAppointments = weekDays.reduce((acc, day) => {
    return acc + (appointmentsByDate[day]?.length || 0);
  }, 0);

  const isCurrentWeek = currentMonday === initialMonday;

  return (
    <div className="space-y-6">
      {/* Top Header: Week Range, Total Count & Controls */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium text-zinc-500">
            {formatWeekHeading(currentMonday, weekSunday)}
          </p>
          <h2 className="mt-1 text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl">
            <span className="tabular-nums">{totalWeeklyAppointments}</span>{" "}
            appointments this week
          </h2>
        </div>

        {/* Right: Service legend & Week switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Service Legend */}
          <div className="hidden xl:flex items-center gap-3 text-xs font-medium text-zinc-600">
            <span className="flex items-center gap-1.5">
              <ServiceDot service="Cleaning" /> Cleaning
            </span>
            <span className="flex items-center gap-1.5">
              <ServiceDot service="Filling" /> Filling
            </span>
            <span className="flex items-center gap-1.5">
              <ServiceDot service="Root canal" /> Root canal
            </span>
            <span className="flex items-center gap-1.5">
              <ServiceDot service="Whitening" /> Whitening
            </span>
            <span className="flex items-center gap-1.5">
              <ServiceDot service="Extraction" /> Extraction
            </span>
          </div>

          {/* Week Navigation Buttons */}
          <div className="flex items-center rounded-xl border border-zinc-200 bg-white p-0.5 shadow-xs">
            <button
              type="button"
              onClick={() => onWeekChange(shiftDate(currentMonday, -7))}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
              aria-label="Previous week"
              title="Previous week"
            >
              <ChevronLeftIcon size={18} />
            </button>

            <button
              type="button"
              onClick={() => onWeekChange(initialDate)}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
                isCurrentWeek
                  ? "bg-teal-700 text-white shadow-xs"
                  : "text-zinc-700 hover:bg-zinc-100"
              }`}
            >
              This week
            </button>

            <button
              type="button"
              onClick={() => onWeekChange(shiftDate(currentMonday, 7))}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
              aria-label="Next week"
              title="Next week"
            >
              <ChevronRightIcon size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* 7-Column Grid (Desktop 7 cols, Tablet horizontal scroll with snap) */}
      <div className="relative -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex gap-3 overflow-x-auto pb-4 snap-x lg:grid lg:grid-cols-7 lg:gap-3 lg:overflow-visible">
          {weekDays.map((dayDate) => {
            const isToday = dayDate === initialDate;
            const isSunday = isSundayDate(dayDate);
            const isSaturday = isSaturdayDate(dayDate);
            const dayAppointments = appointmentsByDate[dayDate] || [];
            const count = dayAppointments.length;
            const dayAbbr = getDayAbbr(dayDate);
            const dayMonth = formatDayMonth(dayDate);

            return (
              <div
                key={dayDate}
                className={`flex flex-col min-w-[210px] lg:min-w-0 flex-1 snap-start rounded-2xl border transition-all ${
                  isToday
                    ? "border-teal-700 bg-teal-50/20 ring-1 ring-teal-700/30"
                    : "border-zinc-200 bg-zinc-50/50"
                }`}
              >
                {/* Column Header */}
                <div
                  onClick={() => onSelectDay(dayDate)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") onSelectDay(dayDate);
                  }}
                  className={`flex cursor-pointer items-start justify-between border-b p-3.5 transition-colors rounded-t-2xl ${
                    isToday
                      ? "border-teal-200/80 bg-teal-50/60 hover:bg-teal-100/50"
                      : "border-zinc-200 bg-white hover:bg-zinc-100/60"
                  }`}
                  title="Click to view full day schedule"
                >
                  <div>
                    <span
                      className={`text-[11px] font-bold tracking-wider uppercase ${
                        isToday ? "text-teal-800" : "text-zinc-500"
                      }`}
                    >
                      {isToday ? `${dayAbbr} · TODAY` : dayAbbr}
                    </span>
                    <h3 className="mt-0.5 text-base font-bold text-zinc-900 tracking-tight">
                      {dayMonth}
                    </h3>
                  </div>

                  {/* Count Badge */}
                  <div>
                    {isSunday ? (
                      <span className="inline-flex rounded-full bg-zinc-100 px-2.5 py-0.5 text-[11px] font-semibold text-zinc-500">
                        Closed
                      </span>
                    ) : (
                      <span
                        className={`inline-flex h-6 min-w-[24px] items-center justify-center rounded-full px-1.5 text-xs font-bold tabular-nums shadow-xs ${
                          isToday
                            ? "bg-teal-700 text-white"
                            : count > 0
                            ? "bg-zinc-100 text-zinc-800"
                            : "bg-zinc-100 text-zinc-400"
                        }`}
                      >
                        {count}
                      </span>
                    )}
                  </div>
                </div>

                {/* Column Body: Appointments Stack */}
                <div className="flex-1 space-y-2 p-2.5">
                  {isLoading ? (
                    <div className="space-y-2">
                      {[0, 1, 2].map((i) => (
                        <div
                          key={i}
                          className="h-16 animate-pulse rounded-xl bg-zinc-200/70"
                        />
                      ))}
                    </div>
                  ) : isSunday ? (
                    <div className="rounded-xl border border-dashed border-zinc-200 bg-white/60 p-4 text-center">
                      <p className="text-xs font-medium text-zinc-400">
                        Closed on Sundays
                      </p>
                    </div>
                  ) : count === 0 ? (
                    <div className="rounded-xl border border-dashed border-zinc-200 bg-white/60 p-4 text-center">
                      <p className="text-xs font-medium text-zinc-500">
                        No appointments yet
                      </p>
                      <p className="mt-1 text-[11px] text-zinc-400">
                        {isSaturday ? "Open 10:00 – 14:00" : "Open 09:00 – 18:00"}
                      </p>
                    </div>
                  ) : (
                    dayAppointments.map((apt) => {
                      const startTime = formatTime(apt.start, timeZone);
                      const durationMinutes = Math.round(
                        (Date.parse(apt.end) - Date.parse(apt.start)) / 60_000,
                      );

                      return (
                        <div
                          key={apt.id}
                          onClick={() => onSelectAppointment(apt)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ")
                              onSelectAppointment(apt);
                          }}
                          className="group relative cursor-pointer rounded-xl border border-zinc-200 bg-white p-3 shadow-xs hover:border-teal-500 hover:shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
                        >
                          {/* Time & Duration */}
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold tabular-nums text-zinc-900 group-hover:text-teal-800">
                              {startTime}
                            </span>
                            <span className="text-[11px] tabular-nums text-zinc-400">
                              {durationMinutes} min
                            </span>
                          </div>

                          {/* Patient Name */}
                          <h4 className="mt-1 text-sm font-semibold text-zinc-800 tracking-tight truncate">
                            {apt.patientName}
                          </h4>

                          {/* Service Pill */}
                          <div className="mt-2">
                            <ServiceChip service={apt.service} />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
