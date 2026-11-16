import React from "react";
import { PhoneIcon, ChatBubbleIcon } from "./ui/icons";

interface NextUpCardProps {
  patientName: string;
  service: string;
  timeRange: string;
  phone: string;
  inMinutes?: number;
}

export function NextUpCard({
  patientName,
  service,
  timeRange,
  phone,
  inMinutes = 25,
}: NextUpCardProps) {
  const cleanPhone = phone.replace(/[^\d+]/g, "");
  const waPhone = phone.replace(/[^\d]/g, "");

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-xs">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-[11px] font-bold tracking-wider uppercase text-zinc-500">
            Next · {inMinutes > 0 ? `in ${inMinutes} min` : "soon"}
          </span>
          <h4 className="mt-1 text-lg font-bold tracking-tight text-zinc-900">
            {patientName}
          </h4>
          <p className="mt-0.5 text-xs font-medium text-zinc-600">
            {service} · <span className="tabular-nums">{timeRange}</span>
          </p>
        </div>

        {/* Quick actions: Call and WhatsApp */}
        {cleanPhone ? (
          <div className="flex items-center gap-1.5 pt-1">
            <a
              href={`tel:${cleanPhone}`}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-200 transition-colors"
              title={`Call ${patientName}`}
              aria-label={`Call ${patientName}`}
            >
              <PhoneIcon size={16} />
            </a>
            <a
              href={`https://wa.me/${waPhone}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-200 transition-colors"
              title={`Open WhatsApp chat with ${patientName}`}
              aria-label={`Open WhatsApp chat with ${patientName}`}
            >
              <ChatBubbleIcon size={16} />
            </a>
          </div>
        ) : null}
      </div>
    </div>
  );
}
