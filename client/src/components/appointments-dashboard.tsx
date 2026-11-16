"use client";

import React, { useEffect, useState, useMemo } from "react";
import type { Appointment, AppointmentsResponse } from "@/lib/api";
import {
  formatDateHeading,
  formatTime,
  isAppointmentsResponse,
  isSundayDate,
  shiftDate,
  getMondayOfWeek,
  getWeekDays,
} from "@/lib/api";
import { ScheduleHeader } from "./schedule-header";
import { DaySwitcher } from "./day-switcher";
import { ServiceChip, getServiceColor } from "./ui/service-chip";
import { NowCard } from "./ui/card";
import { NextUpCard } from "./next-up-card";
import { AppointmentRowDesktop } from "./appointment-row-desktop";
import { AppointmentCardMobile } from "./appointment-card-mobile";
import { FreeGapRow } from "./free-gap-row";
import { AppointmentDetailSheet } from "./appointment-detail-sheet";
import { WeekView } from "./week-view";
import {
  EmptyState,
  ClosedSundayState,
  ErrorState,
  LoadingSkeleton,
} from "./state-views";

interface AppointmentsDashboardProps {
  timeZone: string;
  initialDate: string;
}

interface FreeGap {
  startTime: string;
  durationText: string;
  untilText?: string;
  afterIndex: number;
}

export function AppointmentsDashboard({
  timeZone,
  initialDate,
}: AppointmentsDashboardProps) {
  const [date, setDate] = useState(initialDate);
  const [data, setData] = useState<AppointmentsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [lastUpdated, setLastUpdated] = useState<string>("11:35");
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [viewMode, setViewMode] = useState<"day" | "week">("day");

  // Week appointments cache: Record<dayDate, Appointment[]>
  const [weekData, setWeekData] = useState<Record<string, Appointment[]>>({});
  const [weekLoading, setWeekLoading] = useState(false);

  // Fetch appointments for day view on date/reloadKey change
  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/appointments?date=${encodeURIComponent(date)}`,
          { cache: "no-store", signal: controller.signal },
        );

        if (!response.ok) {
          throw new Error(
            response.status === 401
              ? "Your session has expired. Please sign in again."
              : "Google Calendar didn't respond. Your bookings are safe.",
          );
        }

        const payload: unknown = await response.json();
        if (!isAppointmentsResponse(payload)) {
          throw new Error("The appointments response was not valid.");
        }

        if (active) {
          setData(payload);
          const now = new Date();
          setCurrentTime(now.getTime());
          setLastUpdated(
            now.toLocaleTimeString("en-GB", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            }),
          );
        }
      } catch (caught: unknown) {
        if (!active || controller.signal.aborted) return;
        setError(
          caught instanceof Error
            ? caught.message
            : "Appointments could not be loaded.",
        );
      } finally {
        if (active) setLoading(false);
      }
    };

    void Promise.resolve().then(load);

    return () => {
      active = false;
      controller.abort();
    };
  }, [date, reloadKey]);

  // Fetch week appointments when in week mode
  useEffect(() => {
    if (viewMode !== "week") return;

    const controller = new AbortController();
    let active = true;

    const loadWeek = async () => {
      setWeekLoading(true);
      const monday = getMondayOfWeek(date);
      const days = getWeekDays(monday);

      try {
        const fetchPromises = days.map(async (dayStr) => {
          try {
            const res = await fetch(
              `/api/appointments?date=${encodeURIComponent(dayStr)}`,
              { cache: "no-store", signal: controller.signal },
            );
            if (!res.ok) return { day: dayStr, items: [] };
            const payload: unknown = await res.json();
            if (isAppointmentsResponse(payload)) {
              return { day: dayStr, items: payload.appointments };
            }
            return { day: dayStr, items: [] };
          } catch {
            return { day: dayStr, items: [] };
          }
        });

        const results = await Promise.all(fetchPromises);
        if (active) {
          const map: Record<string, Appointment[]> = {};
          results.forEach(({ day, items }) => {
            map[day] = items;
          });
          setWeekData(map);
        }
      } finally {
        if (active) setWeekLoading(false);
      }
    };

    void Promise.resolve().then(loadWeek);

    return () => {
      active = false;
      controller.abort();
    };
  }, [date, viewMode, reloadKey]);

  // 60-second auto-refresh polling
  useEffect(() => {
    const interval = setInterval(() => {
      setReloadKey((prev) => prev + 1);
    }, 60_000);

    return () => clearInterval(interval);
  }, []);

  const appointments = useMemo(
    () => data?.appointments ?? [],
    [data?.appointments],
  );

  // Service breakdown counts
  const serviceCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    appointments.forEach((apt) => {
      const s = apt.service.trim();
      let category = "Other";
      if (/clean/i.test(s)) category = "Cleaning";
      else if (/fill/i.test(s)) category = "Filling";
      else if (/root|canal/i.test(s)) category = "Root canal";
      else if (/whiten/i.test(s)) category = "Whitening";
      else if (/extract/i.test(s)) category = "Extraction";
      else category = s;

      counts[category] = (counts[category] || 0) + 1;
    });
    return counts;
  }, [appointments]);

  // Active (Now) appointment & Next appointment
  const { activeAppointment, nextAppointment, remainingNowMinutes, inMinutesNext } =
    useMemo(() => {
      const now = currentTime;
      const active = appointments.find((a) => a.status === "now");
      const upcoming = appointments.filter((a) => a.status === "upcoming");
      const next = upcoming[0];

      let remainingNow = 25;
      if (active && now > 0) {
        const end = Date.parse(active.end);
        remainingNow = Math.max(0, Math.round((end - now) / 60_000));
      }

      let inNext = 25;
      if (next && now > 0) {
        const start = Date.parse(next.start);
        inNext = Math.max(0, Math.round((start - now) / 60_000));
      }

      return {
        activeAppointment: active,
        nextAppointment: next,
        remainingNowMinutes: remainingNow,
        inMinutesNext: inNext,
      };
    }, [appointments, currentTime]);

  // Total booked time & free time
  const { bookedText, freeText } = useMemo(() => {
    let bookedMinutes = 0;
    appointments.forEach((apt) => {
      const ms = Date.parse(apt.end) - Date.parse(apt.start);
      if (ms > 0) bookedMinutes += Math.round(ms / 60_000);
    });

    const totalClinicMinutes = 9 * 60; // 09:00 to 18:00 = 540 min
    const freeMinutes = Math.max(0, totalClinicMinutes - bookedMinutes);

    const formatDuration = (mins: number) => {
      const h = Math.floor(mins / 60);
      const m = mins % 60;
      return `${h} h ${m} m`;
    };

    return {
      bookedText: formatDuration(bookedMinutes),
      freeText: formatDuration(freeMinutes),
    };
  }, [appointments]);

  // Free gaps calculation
  const freeGaps = useMemo<FreeGap[]>(() => {
    const gaps: FreeGap[] = [];
    if (appointments.length === 0) return gaps;

    for (let i = 0; i < appointments.length - 1; i++) {
      const curr = appointments[i];
      const next = appointments[i + 1];
      if (!curr || !next) continue;

      const currEnd = Date.parse(curr.end);
      const nextStart = Date.parse(next.start);
      const gapMins = Math.round((nextStart - currEnd) / 60_000);

      if (gapMins >= 10) {
        const startStr = formatTime(curr.end, timeZone);
        const untilStr = formatTime(next.start, timeZone);

        const hours = Math.floor(gapMins / 60);
        const minutes = gapMins % 60;
        const durationText =
          hours > 0
            ? `${hours} h ${minutes > 0 ? `${minutes} min` : ""} free`
            : `${minutes} min free`;

        gaps.push({
          startTime: startStr,
          durationText,
          untilText: untilStr,
          afterIndex: i,
        });
      }
    }

    return gaps;
  }, [appointments, timeZone]);

  const isSunday = isSundayDate(date);
  const totalCount = appointments.length;

  return (
    <div className="min-h-[100dvh] bg-zinc-50/70 pb-16">
      {/* Header */}
      <ScheduleHeader
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        lastUpdated={lastUpdated}
        isRefreshing={loading || weekLoading}
      />

      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        {/* VIEW 1: WEEK VIEW */}
        {viewMode === "week" ? (
          <WeekView
            currentDate={date}
            initialDate={initialDate}
            timeZone={timeZone}
            appointmentsByDate={weekData}
            isLoading={weekLoading}
            onSelectDay={(selectedDate) => {
              setDate(selectedDate);
              setViewMode("day");
            }}
            onSelectAppointment={(apt) => setSelectedAppointment(apt)}
            onWeekChange={(newDate) => setDate(newDate)}
          />
        ) : (
          /* VIEW 2: DAY VIEW */
          <>
            {/* Subheader: Date & Action Controls */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-teal-800">
                  Good morning, Dr. Khan
                </p>
                <h1 className="mt-1 text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900">
                  <span className="tabular-nums font-extrabold">{totalCount}</span>{" "}
                  appointments {date === initialDate ? "today" : ""}
                </h1>
                <p className="mt-1 text-sm text-zinc-500">
                  {formatDateHeading(date)}
                </p>
              </div>

              <DaySwitcher
                currentDate={date}
                initialDate={initialDate}
                onDateChange={setDate}
              />
            </div>

            {/* Loading state */}
            {loading && !data ? <LoadingSkeleton /> : null}

            {/* Error state */}
            {!loading && error ? (
              <ErrorState
                error={error}
                onRetry={() => setReloadKey((prev) => prev + 1)}
              />
            ) : null}

            {/* Sunday closed state */}
            {!loading && !error && isSunday ? (
              <ClosedSundayState
                onGoToNextDay={() => setDate(shiftDate(date, 1))}
              />
            ) : null}

            {/* Empty state (non-Sunday) */}
            {!loading && !error && !isSunday && totalCount === 0 ? (
              <EmptyState
                date={date}
                onRefresh={() => setReloadKey((prev) => prev + 1)}
              />
            ) : null}

            {/* Active schedule display */}
            {!loading && !error && !isSunday && totalCount > 0 ? (
              <>
                {/* Horizontal Service Chips (Mobile + Desktop Top) */}
                <div className="mt-6 flex flex-wrap items-center gap-2">
                  {Object.entries(serviceCounts).map(([service, count]) => (
                    <ServiceChip key={service} service={service} count={count} />
                  ))}
                </div>

                {/* Split Layout: Schedule (Cols 1-8) + Sidebar (Cols 9-12) */}
                <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-12">
                  {/* Left Column: Schedule Timeline */}
                  <section className="lg:col-span-8">
                    {/* Active appointment Hero on Mobile */}
                    {activeAppointment ? (
                      <div className="mb-4 lg:hidden">
                        <NowCard
                          patientName={activeAppointment.patientName}
                          service={activeAppointment.service}
                          timeRange={`${formatTime(
                            activeAppointment.start,
                            timeZone,
                          )} – ${formatTime(activeAppointment.end, timeZone)}`}
                          remainingMinutes={remainingNowMinutes}
                          onClick={() => setSelectedAppointment(activeAppointment)}
                        />
                      </div>
                    ) : null}

                    {/* Next up Hero on Mobile */}
                    {nextAppointment && !activeAppointment ? (
                      <div className="mb-4 lg:hidden">
                        <NextUpCard
                          patientName={nextAppointment.patientName}
                          service={nextAppointment.service}
                          timeRange={`${formatTime(
                            nextAppointment.start,
                            timeZone,
                          )} – ${formatTime(nextAppointment.end, timeZone)}`}
                          phone={nextAppointment.phone}
                          inMinutes={inMinutesNext}
                        />
                      </div>
                    ) : null}

                    {/* Section header */}
                    <div className="flex items-center justify-between pb-3">
                      <h2 className="text-lg font-bold text-zinc-900">
                        Schedule
                      </h2>
                      <span className="text-xs text-zinc-500 font-medium">
                        Open 09:00 – 18:00
                      </span>
                    </div>

                    {/* Mobile Cards Stream */}
                    <div className="space-y-3 lg:hidden">
                      {appointments.map((appointment, idx) => {
                        const gap = freeGaps.find((g) => g.afterIndex === idx);
                        return (
                          <React.Fragment key={appointment.id}>
                            <AppointmentCardMobile
                              appointment={appointment}
                              timeZone={timeZone}
                              onSelect={() => setSelectedAppointment(appointment)}
                            />
                            {gap ? (
                              <FreeGapRow
                                startTime={gap.startTime}
                                durationText={gap.durationText}
                                untilText={gap.untilText}
                              />
                            ) : null}
                          </React.Fragment>
                        );
                      })}
                    </div>

                    {/* Desktop Tabular View */}
                    <div className="hidden lg:block overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xs">
                      <table className="w-full border-collapse text-left">
                        <thead>
                          <tr className="border-b border-zinc-200 bg-zinc-50 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                            <th className="py-3 pl-4 pr-3">Time</th>
                            <th className="py-3 px-3">Patient</th>
                            <th className="py-3 px-3">Service</th>
                            <th className="py-3 px-3">Length</th>
                            <th className="py-3 px-3">Source</th>
                            <th className="py-3 px-3">Phone</th>
                            <th className="py-3 pl-3 pr-4 text-right">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                          {appointments.map((appointment, idx) => {
                            const gap = freeGaps.find((g) => g.afterIndex === idx);
                            return (
                              <React.Fragment key={appointment.id}>
                                <AppointmentRowDesktop
                              appointment={appointment}
                              timeZone={timeZone}
                              onSelect={() => setSelectedAppointment(appointment)}
                            />
                            {gap ? (
                              <FreeGapRow
                                startTime={gap.startTime}
                                durationText={gap.durationText}
                                untilText={gap.untilText}
                                isDesktop
                              />
                            ) : null}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile view only reminder */}
                <footer className="mt-8 text-center text-xs text-zinc-400 lg:hidden">
                  View only. Bookings, changes and cancellations happen in WhatsApp.
                </footer>
              </section>

              {/* Right Column: Sticky Sidebar on Desktop */}
              <aside className="hidden lg:block lg:col-span-4 space-y-5">
                {/* Now card */}
                {activeAppointment ? (
                  <NowCard
                    patientName={activeAppointment.patientName}
                    service={activeAppointment.service}
                    timeRange={`${formatTime(
                      activeAppointment.start,
                      timeZone,
                    )} – ${formatTime(activeAppointment.end, timeZone)}`}
                    remainingMinutes={remainingNowMinutes}
                    onClick={() => setSelectedAppointment(activeAppointment)}
                    className="cursor-pointer"
                  />
                ) : null}

                {/* Next card */}
                {nextAppointment ? (
                  <NextUpCard
                    patientName={nextAppointment.patientName}
                    service={nextAppointment.service}
                    timeRange={`${formatTime(
                      nextAppointment.start,
                      timeZone,
                    )} – ${formatTime(nextAppointment.end, timeZone)}`}
                    phone={nextAppointment.phone}
                    inMinutes={inMinutesNext}
                  />
                ) : null}

                {/* Services distribution summary card */}
                <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs">
                  <h3 className="text-sm font-bold text-zinc-900">
                    Services today
                  </h3>
                  <div className="mt-3 space-y-2.5">
                    {Object.entries(serviceCounts).map(([srv, count]) => {
                      const { dot } = getServiceColor(srv);
                      return (
                        <div
                          key={srv}
                          className="flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-2 text-zinc-700">
                            <span
                              className={`h-2 w-2 rounded-full ${dot}`}
                              aria-hidden="true"
                            />
                            <span>{srv}</span>
                          </div>
                          <span className="font-bold tabular-nums text-zinc-900">
                            {count}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Booked / Free hours metric */}
                <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wide">
                        Booked
                      </p>
                      <p className="mt-1 text-xl font-bold tabular-nums text-zinc-900">
                        {bookedText}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wide">
                        Free
                      </p>
                      <p className="mt-1 text-xl font-bold tabular-nums text-zinc-900">
                        {freeText}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Reassurance text */}
                <p className="text-center text-xs text-zinc-400">
                  View only. Bookings, changes and cancellations happen in WhatsApp.
                </p>
              </aside>
            </div>
          </>
        ) : null}
        </>
      )}
      </main>

      {/* Appointment Detail Bottom Sheet (Decision #2) */}
      <AppointmentDetailSheet
        appointment={selectedAppointment}
        timeZone={timeZone}
        onClose={() => setSelectedAppointment(null)}
      />
    </div>
  );
}
