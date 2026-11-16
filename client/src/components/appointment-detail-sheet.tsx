"use client";

import React, { useEffect, useRef } from "react";
import type { Appointment } from "@/lib/api";
import { formatTime } from "@/lib/api";
import { ServiceChip } from "./ui/service-chip";
import { Badge } from "./ui/badge";
import { PhoneIcon, ChatBubbleIcon, LockIcon } from "./ui/icons";
import { Button } from "./ui/button";

interface AppointmentDetailSheetProps {
  appointment: Appointment | null;
  timeZone: string;
  onClose: () => void;
}

export function AppointmentDetailSheet({
  appointment,
  timeZone,
  onClose,
}: AppointmentDetailSheetProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Keyboard accessibility: Escape to close & auto-focus
  useEffect(() => {
    if (!appointment) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    closeButtonRef.current?.focus();

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [appointment, onClose]);

  if (!appointment) return null;

  const startFormatted = formatTime(appointment.start, timeZone);
  const endFormatted = formatTime(appointment.end, timeZone);
  const durationMinutes = Math.round(
    (Date.parse(appointment.end) - Date.parse(appointment.start)) / 60_000,
  );

  const cleanPhone = appointment.phone.replace(/[^\d+]/g, "");
  const waPhone = appointment.phone.replace(/[^\d]/g, "");

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="sheet-patient-name"
      className="fixed inset-0 z-50 flex items-end justify-center bg-zinc-900/40 backdrop-blur-xs transition-opacity sm:items-center p-0 sm:p-4"
    >
      {/* Backdrop click */}
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

      {/* Sheet panel */}
      <div className="relative w-full max-w-lg rounded-t-3xl sm:rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl transition-all">
        {/* Handle bar on mobile */}
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-zinc-200 sm:hidden" />

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Badge
                variant={
                  appointment.status === "now"
                    ? "status-now"
                    : appointment.status === "past"
                    ? "status-done"
                    : "status-upcoming"
                }
              >
                {appointment.status === "now"
                  ? "Now"
                  : appointment.status === "past"
                  ? "Done"
                  : "Upcoming"}
              </Badge>
              <Badge variant={appointment.source === "manual" ? "manual" : "bot"}>
                {appointment.source === "manual" ? "Manual" : "Bot"}
              </Badge>
            </div>
            <h3
              id="sheet-patient-name"
              className="mt-2 text-2xl font-bold tracking-tight text-zinc-900"
            >
              {appointment.patientName}
            </h3>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
            aria-label="Close details"
          >
            ✕
          </button>
        </div>

        {/* Details list */}
        <div className="mt-5 space-y-3.5 border-t border-zinc-100 pt-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-500">Service</span>
            <ServiceChip service={appointment.service} />
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-500">Time</span>
            <span className="font-semibold tabular-nums text-zinc-900">
              {startFormatted} – {endFormatted} ({durationMinutes} min)
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-500">Phone</span>
            <span className="font-medium tabular-nums text-zinc-900">
              {appointment.phone || "No phone recorded"}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-500">Booking Channel</span>
            <span className="text-xs font-medium text-zinc-600">
              {appointment.source === "manual"
                ? "Added manually by receptionist"
                : "Booked by WhatsApp Assistant"}
            </span>
          </div>
        </div>

        {/* Contact actions */}
        {cleanPhone ? (
          <div className="mt-6 grid grid-cols-2 gap-3">
            <a
              href={`tel:${cleanPhone}`}
              className="flex h-11 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white font-medium text-zinc-800 shadow-xs hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
            >
              <PhoneIcon size={16} />
              <span>Call Patient</span>
            </a>
            <a
              href={`https://wa.me/${waPhone}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-11 items-center justify-center gap-2 rounded-xl bg-teal-700 font-medium text-white shadow-xs hover:bg-teal-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
            >
              <ChatBubbleIcon size={16} />
              <span>WhatsApp</span>
            </a>
          </div>
        ) : null}

        {/* View only notice */}
        <div className="mt-5 flex items-center justify-center gap-1.5 text-center text-xs text-zinc-400">
          <LockIcon size={13} />
          <span>Read-only: cancellations & changes must be made via WhatsApp</span>
        </div>

        <div className="mt-4 pt-2 border-t border-zinc-100">
          <Button variant="outline" size="md" className="w-full" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
