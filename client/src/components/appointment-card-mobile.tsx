import React from "react";
import type { Appointment } from "@/lib/api";
import { formatTime } from "@/lib/api";
import { ServiceChip } from "./ui/service-chip";
import { Badge } from "./ui/badge";
import { PhoneIcon, ChatBubbleIcon } from "./ui/icons";

interface AppointmentCardMobileProps {
  appointment: Appointment;
  timeZone: string;
  onSelect?: () => void;
}

export function AppointmentCardMobile({
  appointment,
  timeZone,
  onSelect,
}: AppointmentCardMobileProps) {
  const startTime = formatTime(appointment.start, timeZone);
  const endTime = formatTime(appointment.end, timeZone);
  const durationMinutes = Math.round(
    (Date.parse(appointment.end) - Date.parse(appointment.start)) / 60_000,
  );

  const cleanPhone = appointment.phone.replace(/[^\d+]/g, "");
  const waPhone = appointment.phone.replace(/[^\d]/g, "");
  const isNow = appointment.status === "now";

  return (
    <div
      onClick={onSelect}
      className={`rounded-2xl border bg-white p-4 shadow-xs transition-all cursor-pointer ${
        isNow
          ? "border-teal-700 ring-2 ring-teal-600/20 shadow-sm"
          : "border-zinc-200/90 hover:border-zinc-300"
      }`}
    >
      {/* Top Header: Time & Status */}
      <div className="flex items-start justify-between">
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-bold tabular-nums tracking-tight text-zinc-900">
            {startTime}
          </span>
          <span className="text-xs font-medium tabular-nums text-zinc-400">
            {endTime}
          </span>
        </div>

        <div>
          {appointment.status === "now" ? (
            <Badge variant="status-now" size="sm">
              Now
            </Badge>
          ) : appointment.status === "past" ? (
            <span className="text-xs font-semibold text-zinc-400">Done</span>
          ) : (
            <span className="text-xs font-semibold text-teal-800">Upcoming</span>
          )}
        </div>
      </div>

      {/* Patient Name */}
      <div className="mt-2.5">
        <h4 className="text-base font-bold text-zinc-900 tracking-tight">
          {appointment.patientName}
        </h4>
      </div>

      {/* Service, Duration & Source */}
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <ServiceChip service={appointment.service} />
        <span className="text-xs text-zinc-500 tabular-nums">
          {durationMinutes} min
        </span>
        <Badge variant={appointment.source === "manual" ? "manual" : "bot"} size="sm">
          {appointment.source === "manual" ? "MANUAL" : "BOT"}
        </Badge>
      </div>

      {/* Contact Line */}
      {cleanPhone ? (
        <div className="mt-3.5 flex items-center justify-between border-t border-zinc-100 pt-2.5 text-xs">
          <a
            href={`tel:${cleanPhone}`}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1.5 font-medium tabular-nums text-teal-800 hover:text-teal-950"
            title={`Call ${appointment.patientName}`}
          >
            <PhoneIcon size={14} className="text-teal-700" />
            <span>{appointment.phone}</span>
          </a>

          <a
            href={`https://wa.me/${waPhone}`}
            onClick={(e) => e.stopPropagation()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-50 text-teal-700 hover:bg-teal-100 transition-colors"
            title="Open WhatsApp chat"
            aria-label="Open WhatsApp chat"
          >
            <ChatBubbleIcon size={15} />
          </a>
        </div>
      ) : null}
    </div>
  );
}
