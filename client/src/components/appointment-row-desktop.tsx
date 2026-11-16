import React from "react";
import type { Appointment } from "@/lib/api";
import { formatTime } from "@/lib/api";
import { ServiceChip } from "./ui/service-chip";
import { Badge } from "./ui/badge";
import { PhoneIcon, ChatBubbleIcon } from "./ui/icons";

interface AppointmentRowDesktopProps {
  appointment: Appointment;
  timeZone: string;
  onSelect?: () => void;
}

export function AppointmentRowDesktop({
  appointment,
  timeZone,
  onSelect,
}: AppointmentRowDesktopProps) {
  const startTime = formatTime(appointment.start, timeZone);
  const endTime = formatTime(appointment.end, timeZone);
  const durationMinutes = Math.round(
    (Date.parse(appointment.end) - Date.parse(appointment.start)) / 60_000,
  );

  const cleanPhone = appointment.phone.replace(/[^\d+]/g, "");
  const waPhone = appointment.phone.replace(/[^\d]/g, "");
  const isNow = appointment.status === "now";

  return (
    <tr
      onClick={onSelect}
      className={`border-b border-zinc-100 transition-colors cursor-pointer ${
        isNow
          ? "bg-teal-50/40 border-l-4 border-l-teal-700"
          : "hover:bg-zinc-50/80"
      }`}
    >
      {/* Time */}
      <td className="py-3.5 pl-4 pr-3 font-bold text-sm tabular-nums text-zinc-900 whitespace-nowrap">
        {startTime} <span className="text-zinc-400 font-normal">–</span> {endTime}
      </td>

      {/* Patient Name */}
      <td className="py-3.5 px-3 font-semibold text-sm text-zinc-900">
        {appointment.patientName}
      </td>

      {/* Service */}
      <td className="py-3.5 px-3">
        <ServiceChip service={appointment.service} />
      </td>

      {/* Length */}
      <td className="py-3.5 px-3 text-xs text-zinc-500 tabular-nums whitespace-nowrap">
        {durationMinutes} min
      </td>

      {/* Source */}
      <td className="py-3.5 px-3">
        <Badge variant={appointment.source === "manual" ? "manual" : "bot"} size="sm">
          {appointment.source === "manual" ? "MANUAL" : "BOT"}
        </Badge>
      </td>

      {/* Phone */}
      <td className="py-3.5 px-3 whitespace-nowrap">
        {cleanPhone ? (
          <div className="flex items-center gap-2">
            <a
              href={`tel:${cleanPhone}`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1.5 text-xs font-medium text-teal-800 hover:text-teal-950 tabular-nums hover:underline"
              title={`Call ${appointment.patientName}`}
            >
              <PhoneIcon size={14} className="text-teal-700 shrink-0" />
              <span>{appointment.phone}</span>
            </a>
            <a
              href={`https://wa.me/${waPhone}`}
              onClick={(e) => e.stopPropagation()}
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal-700 hover:text-teal-900"
              title="Open WhatsApp"
              aria-label="Open WhatsApp"
            >
              <ChatBubbleIcon size={14} />
            </a>
          </div>
        ) : (
          <span className="text-xs text-zinc-400 italic">No number</span>
        )}
      </td>

      {/* Status */}
      <td className="py-3.5 pl-3 pr-4 text-right">
        {appointment.status === "now" ? (
          <Badge variant="status-now" size="sm">
            Now
          </Badge>
        ) : appointment.status === "past" ? (
          <span className="text-xs font-medium text-zinc-400">Done</span>
        ) : (
          <Badge variant="status-upcoming" size="sm">
            Upcoming
          </Badge>
        )}
      </td>
    </tr>
  );
}
