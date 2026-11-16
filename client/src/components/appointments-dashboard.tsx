"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  apiPath,
  type Appointment,
  type AppointmentStatus,
  type AppointmentsResponse,
} from "@/lib/api";

interface AppointmentsDashboardProps {
  timeZone: string;
  initialDate: string;
}

const statusStyles: Record<AppointmentStatus, string> = {
  BOOKED: "bg-amber-100 text-amber-800",
  CONFIRMED: "bg-sky-100 text-sky-800",
  COMPLETED: "bg-emerald-100 text-emerald-800",
  CANCELLED: "bg-rose-100 text-rose-700",
  NO_SHOW: "bg-zinc-200 text-zinc-700",
};

const statusLabels: Record<AppointmentStatus, string> = {
  BOOKED: "Booked",
  CONFIRMED: "Confirmed",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  NO_SHOW: "No show",
};

const activeStatuses: AppointmentStatus[] = ["BOOKED", "CONFIRMED"];

function shiftDate(date: string, days: number): string {
  const value = new Date(`${date}T12:00:00Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}

function formatTime(iso: string, timeZone: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

function formatDateLabel(date: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00Z`));
}

function SummaryCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: number;
  hint: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <p className="text-sm font-medium text-zinc-500">{label}</p>
      <p className="mt-1 text-3xl font-semibold tabular-nums text-zinc-900">
        {value}
      </p>
      <p className="mt-1 text-xs text-zinc-500">{hint}</p>
    </div>
  );
}

function AppointmentRow({
  appointment,
  timeZone,
}: {
  appointment: Appointment;
  timeZone: string;
}) {
  return (
    <li className="flex flex-col gap-2 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-4">
        <div className="w-20 shrink-0">
          <p className="text-base font-semibold tabular-nums text-zinc-900">
            {formatTime(appointment.startsAt, timeZone)}
          </p>
          <p className="text-xs text-zinc-500">
            {appointment.durationMinutes} min
          </p>
        </div>
        <div className="min-w-0">
          <p className="truncate font-medium text-zinc-900">
            {appointment.patientName}
          </p>
          <p className="truncate text-sm text-zinc-600">{appointment.service}</p>
        </div>
      </div>
      <span
        className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${
          statusStyles[appointment.status]
        }`}
      >
        {statusLabels[appointment.status]}
      </span>
    </li>
  );
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
  const [now, setNow] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    const token = window.localStorage.getItem("token");
    if (!token) {
      // The auth state is already known on mount, so no request is made.
      /* eslint-disable react-hooks/set-state-in-effect */
      setData(null);
      setError("Please sign in to view the appointment list.");
      setLoading(false);
      /* eslint-enable react-hooks/set-state-in-effect */
      return () => controller.abort();
    }

    setLoading(true);
    setError(null);

    fetch(`${apiPath("/appointments")}?date=${encodeURIComponent(date)}`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: controller.signal,
      cache: "no-store",
    })
      .then(async (response) => {
        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            throw new Error("Your session has expired. Please sign in again.");
          }
          const body: unknown = await response.json().catch(() => null);
          const message =
            typeof body === "object" &&
            body !== null &&
            "message" in body &&
            typeof body.message === "string"
              ? body.message
              : "Could not load appointments.";
          throw new Error(message);
        }
        return (await response.json()) as AppointmentsResponse;
      })
      .then((payload) => {
        if (!active) return;
        setData(payload);
        setNow(Date.now());
      })
      .catch((caught: unknown) => {
        if (!active || controller.signal.aborted) return;
        setError(
          caught instanceof Error
            ? caught.message
            : "Could not load appointments.",
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [date, reloadKey]);

  const appointments = data?.appointments ?? [];
  const cancelled = appointments.filter(
    (appointment) => appointment.status === "CANCELLED",
  ).length;
  const completed = appointments.filter(
    (appointment) => appointment.status === "COMPLETED",
  ).length;
  const upcoming = appointments.filter(
    (appointment) =>
      activeStatuses.includes(appointment.status) &&
      new Date(appointment.startsAt).getTime() >= now,
  );
  const nextAppointment = upcoming[0];

  return (
    <div className="min-h-screen bg-zinc-50">
      <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-10">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-sky-700">
              Dental clinic dashboard
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
              Today&apos;s appointments
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              {formatDateLabel(date)} · {timeZone}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setDate((current) => shiftDate(current, -1))}
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
              aria-label="Previous day"
            >
              Previous
            </button>
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              aria-label="Appointment date"
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-700"
            />
            <button
              type="button"
              onClick={() => setDate((current) => shiftDate(current, 1))}
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
              aria-label="Next day"
            >
              Next
            </button>
            <button
              type="button"
              onClick={() => setDate(initialDate)}
              className="rounded-lg bg-sky-700 px-3 py-2 text-sm font-semibold text-white hover:bg-sky-800"
            >
              Today
            </button>
          </div>
        </header>

        {loading && (
          <div role="status" aria-live="polite" className="mt-8">
            <span className="sr-only">Loading appointments</span>
            <div className="grid gap-3 sm:grid-cols-3">
              {[0, 1, 2].map((item) => (
                <div
                  key={item}
                  className="h-28 animate-pulse rounded-xl bg-zinc-200"
                />
              ))}
            </div>
            <div className="mt-6 space-y-3">
              {[0, 1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-20 animate-pulse rounded-xl bg-zinc-200"
                />
              ))}
            </div>
          </div>
        )}

        {!loading && error && (
          <div
            role="alert"
            className="mt-8 rounded-xl border border-rose-200 bg-rose-50 p-6"
          >
            <h2 className="text-base font-semibold text-rose-900">
              Appointments could not be loaded
            </h2>
            <p className="mt-1 text-sm text-rose-800">{error}</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setReloadKey((key) => key + 1)}
                className="rounded-lg bg-rose-700 px-3 py-2 text-sm font-semibold text-white hover:bg-rose-800"
              >
                Try again
              </button>
              <Link
                href="/signin"
                className="rounded-lg border border-rose-300 px-3 py-2 text-sm font-semibold text-rose-800 hover:bg-rose-100"
              >
                Sign in
              </Link>
            </div>
          </div>
        )}

        {!loading && !error && (
          <>
            <section className="mt-8 grid gap-3 sm:grid-cols-3">
              <SummaryCard
                label="Total today"
                value={appointments.length}
                hint={
                  cancelled > 0
                    ? `${cancelled} cancelled`
                    : "All scheduled appointments"
                }
              />
              <SummaryCard
                label="Upcoming"
                value={upcoming.length}
                hint={
                  nextAppointment
                    ? `Next at ${formatTime(nextAppointment.startsAt, timeZone)}`
                    : "Nothing left today"
                }
              />
              <SummaryCard
                label="Completed"
                value={completed}
                hint={
                  appointments.length > 0
                    ? `${completed} of ${appointments.length} done`
                    : "No appointments scheduled"
                }
              />
            </section>

            <section className="mt-8">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-zinc-900">
                  Schedule
                </h2>
                <button
                  type="button"
                  onClick={() => setReloadKey((key) => key + 1)}
                  className="text-sm font-medium text-sky-700 hover:text-sky-900"
                >
                  Refresh
                </button>
              </div>

              {appointments.length === 0 ? (
                <div className="mt-4 rounded-xl border border-dashed border-zinc-300 bg-white p-10 text-center">
                  <p className="text-base font-medium text-zinc-800">
                    No appointments for this day
                  </p>
                  <p className="mt-1 text-sm text-zinc-500">
                    Choose another date or check back later. Bookings are taken
                    through WhatsApp.
                  </p>
                </div>
              ) : (
                <ol className="mt-4 space-y-3">
                  {appointments.map((appointment) => (
                    <AppointmentRow
                      key={appointment.id}
                      appointment={appointment}
                      timeZone={timeZone}
                    />
                  ))}
                </ol>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
