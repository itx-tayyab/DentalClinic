import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "muted" | "highlight";
}

export function Card({
  children,
  variant = "default",
  className = "",
  ...props
}: CardProps) {
  const variantStyles = {
    default: "bg-white border border-zinc-200 shadow-xs",
    muted: "bg-zinc-50 border border-zinc-200/80",
    highlight: "bg-white border-2 border-teal-700 shadow-sm",
  }[variant];

  return (
    <div
      className={`rounded-xl p-4 sm:p-5 transition-shadow ${variantStyles} ${className}`.trim()}
      {...props}
    >
      {children}
    </div>
  );
}

export interface NowCardProps extends React.HTMLAttributes<HTMLDivElement> {
  patientName: string;
  service: string;
  timeRange: string;
  remainingMinutes?: number;
  totalMinutes?: number;
}

export function NowCard({
  patientName,
  service,
  timeRange,
  remainingMinutes,
  totalMinutes = 60,
  className = "",
  ...props
}: NowCardProps) {
  const percentComplete =
    remainingMinutes !== undefined && totalMinutes > 0
      ? Math.max(0, Math.min(100, Math.round(((totalMinutes - remainingMinutes) / totalMinutes) * 100)))
      : 50;

  return (
    <div
      className={`rounded-2xl bg-teal-800 p-5 text-white shadow-md border border-teal-700/60 relative overflow-hidden ${className}`.trim()}
      {...props}
    >
      <div className="flex items-center justify-between text-xs font-semibold tracking-wide uppercase text-teal-200">
        <div className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Now</span>
        </div>
        {remainingMinutes !== undefined ? (
          <span className="text-teal-100 normal-case font-medium">{remainingMinutes} min left</span>
        ) : null}
      </div>

      <div className="mt-3">
        <h3 className="text-2xl font-bold tracking-tight text-white">{patientName}</h3>
        <p className="mt-1 text-sm font-medium text-teal-100">
          {service} · <span className="tabular-nums">{timeRange}</span>
        </p>
      </div>

      {/* Progress track */}
      <div
        className="mt-4 h-1.5 w-full rounded-full bg-teal-900/80 overflow-hidden"
        role="progressbar"
        aria-valuenow={percentComplete}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Appointment progress: ${percentComplete}%`}
      >
        <div
          className="h-full bg-teal-300 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentComplete}%` }}
        />
      </div>
    </div>
  );
}
