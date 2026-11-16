import type { Metadata } from "next";
import { PasswordInput } from "@/components/ui/password-input";
import { Button } from "@/components/ui/button";
import { LockIcon } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "Sign in · Bright Smile Dental",
  description: "Doctor sign in to view today's appointments.",
};

interface LoginPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const error = typeof params.error === "string";
  const requested = params.next;
  const nextPath =
    typeof requested === "string" &&
    requested.startsWith("/") &&
    !requested.startsWith("//")
      ? requested
      : "/dashboard";

  return (
    <main className="flex min-h-[100dvh] flex-col justify-between bg-zinc-50/60 px-4 py-8 sm:items-center sm:justify-center sm:py-16">
      <div className="w-full max-w-sm sm:max-w-md sm:rounded-2xl sm:border sm:border-zinc-200 sm:bg-white sm:p-8 sm:shadow-xs">
        {/* Clinic emblem */}
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-800 text-lg font-bold text-white shadow-xs">
          BS
        </div>

        {/* Header */}
        <div className="mt-5">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
            Bright Smile Dental
          </h1>
          <p className="mt-1 text-sm text-zinc-600 sm:text-base">
            Sign in to see today&apos;s appointments.
          </p>
        </div>

        {/* Sign in form */}
        <form action="/api/auth/login" method="post" className="mt-8 space-y-4">
          <input type="hidden" name="next" value={nextPath} />

          {/* Email field (Fixed clinic account in v1) */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-zinc-900"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              defaultValue="doctor@brightsmile.clinic"
              readOnly
              className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-zinc-100/70 px-3.5 py-2.5 text-sm text-zinc-700 outline-none cursor-default select-all"
            />
          </div>

          {/* Password field with show/hide toggle */}
          <div>
            <PasswordInput
              id="password"
              name="password"
              label="Password"
              autoFocus
              required
              autoComplete="current-password"
              error={error ? "Incorrect password. Please try again." : undefined}
            />
          </div>

          {/* Submit action */}
          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
            >
              Sign in
            </Button>
          </div>
        </form>

        {/* Reassurance note */}
        <div className="mt-8 flex items-start gap-3 rounded-xl border border-zinc-200/80 bg-zinc-50 p-4 text-xs text-zinc-600 leading-relaxed">
          <LockIcon size={16} className="mt-0.5 shrink-0 text-zinc-500" />
          <span>
            View only. This app reads your clinic calendar and never changes a booking.
          </span>
        </div>
      </div>

      {/* Subtle footer */}
      <footer className="mt-6 text-center text-xs text-zinc-400 sm:mt-8">
        Bright Smile Dental Clinic · Doctor Portal
      </footer>
    </main>
  );
}
