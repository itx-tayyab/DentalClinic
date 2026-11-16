import React from "react";

interface FreeGapRowProps {
  startTime: string;
  durationText: string;
  untilText?: string;
  isDesktop?: boolean;
}

export function FreeGapRow({
  startTime,
  durationText,
  untilText,
  isDesktop = false,
}: FreeGapRowProps) {
  const label = untilText ? `${durationText} until ${untilText}` : durationText;

  if (isDesktop) {
    return (
      <tr className="border-y border-dashed border-zinc-200/90 bg-zinc-50/50 text-xs text-zinc-500">
        <td className="py-2.5 pl-4 pr-3 font-semibold tabular-nums text-zinc-400">
          {startTime}
        </td>
        <td colSpan={6} className="py-2.5 pl-4 pr-4">
          <div className="flex items-center gap-2">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-zinc-300" />
            <span className="italic">{label}</span>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <div className="my-2.5 flex items-center justify-between rounded-xl border border-dashed border-zinc-200/90 bg-zinc-50/70 px-4 py-2.5 text-xs text-zinc-500">
      <span className="font-semibold tabular-nums text-zinc-400">{startTime}</span>
      <span className="italic">{label}</span>
    </div>
  );
}
