"use client";

import React, { useState } from "react";
import { EyeIcon, EyeSlashIcon } from "./icons";

export interface PasswordInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  error?: string;
}

export function PasswordInput({
  label = "Password",
  id = "password",
  name = "password",
  className = "",
  error,
  ...props
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        <label
          htmlFor={id}
          className="block text-sm font-medium text-zinc-900"
        >
          {label}
        </label>
      </div>
      <div className="relative mt-1.5">
        <input
          id={id}
          name={name}
          type={showPassword ? "text" : "password"}
          className={`w-full rounded-xl border bg-white px-3.5 py-2.5 pr-11 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition-colors ${
            error
              ? "border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-100"
              : "border-zinc-300 focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
          } ${className}`.trim()}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-zinc-400 hover:text-zinc-600 focus-visible:outline-none focus-visible:text-teal-700"
          aria-label={showPassword ? "Hide password" : "Show password"}
          tabIndex={0}
        >
          {showPassword ? (
            <EyeSlashIcon size={18} />
          ) : (
            <EyeIcon size={18} />
          )}
        </button>
      </div>
      {error ? (
        <p role="alert" className="mt-1.5 text-xs font-medium text-rose-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}
