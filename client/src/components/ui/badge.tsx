import React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "teal" | "status-now" | "status-upcoming" | "status-done" | "bot" | "manual";
  size?: "sm" | "md";
}

export function Badge({
  children,
  variant = "default",
  size = "md",
  className = "",
  ...props
}: BadgeProps) {
  const sizeStyles = {
    sm: "px-2 py-0.5 text-[10px]",
    md: "px-2.5 py-1 text-xs",
  }[size];

  const variantStyles = {
    default: "bg-zinc-100 text-zinc-700 font-medium",
    teal: "bg-teal-50 text-teal-800 font-semibold border border-teal-200/60",
    "status-now": "bg-teal-700 text-white font-semibold",
    "status-upcoming": "bg-sky-50 text-sky-800 font-medium",
    "status-done": "bg-zinc-100 text-zinc-500 font-medium",
    bot: "bg-teal-50/80 text-teal-700 font-semibold tracking-wider uppercase border border-teal-200/50",
    manual: "bg-zinc-100 text-zinc-600 font-semibold tracking-wider uppercase border border-zinc-200",
  }[variant];

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full ${sizeStyles} ${variantStyles} ${className}`.trim()}
      {...props}
    >
      {children}
    </span>
  );
}
