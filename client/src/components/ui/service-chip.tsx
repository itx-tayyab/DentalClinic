import React from "react";

export type DentalServiceType =
  | "cleaning"
  | "filling"
  | "root canal"
  | "whitening"
  | "extraction"
  | "other"
  | string;

export function getServiceColor(serviceName: string): {
  dot: string;
  bg: string;
  text: string;
} {
  const normalized = serviceName.trim().toLowerCase();

  if (normalized.includes("clean")) {
    return {
      dot: "bg-blue-500",
      bg: "bg-blue-50/80",
      text: "text-blue-700",
    };
  }
  if (normalized.includes("fill")) {
    return {
      dot: "bg-amber-500",
      bg: "bg-amber-50/80",
      text: "text-amber-800",
    };
  }
  if (normalized.includes("root") || normalized.includes("canal")) {
    return {
      dot: "bg-rose-500",
      bg: "bg-rose-50/80",
      text: "text-rose-700",
    };
  }
  if (normalized.includes("whiten")) {
    return {
      dot: "bg-purple-500",
      bg: "bg-purple-50/80",
      text: "text-purple-700",
    };
  }
  if (normalized.includes("extract")) {
    return {
      dot: "bg-emerald-500",
      bg: "bg-emerald-50/80",
      text: "text-emerald-700",
    };
  }

  return {
    dot: "bg-zinc-400",
    bg: "bg-zinc-100",
    text: "text-zinc-700",
  };
}

export function ServiceDot({
  service,
  size = "md",
  className = "",
}: {
  service: string;
  size?: "sm" | "md";
  className?: string;
}) {
  const { dot } = getServiceColor(service);
  const sizeClass = size === "sm" ? "h-1.5 w-1.5" : "h-2 w-2";

  return (
    <span
      className={`inline-block shrink-0 rounded-full ${dot} ${sizeClass} ${className}`.trim()}
      aria-hidden="true"
    />
  );
}

export function ServiceChip({
  service,
  count,
  className = "",
}: {
  service: string;
  count?: number;
  className?: string;
}) {
  const { bg, text } = getServiceColor(service);

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${bg} ${text} ${className}`.trim()}
    >
      <ServiceDot service={service} />
      <span>{service}</span>
      {count !== undefined ? (
        <span className="font-semibold tabular-nums ml-0.5">{count}</span>
      ) : null}
    </span>
  );
}
