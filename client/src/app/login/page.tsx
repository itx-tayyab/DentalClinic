import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign in · Dental Clinic Dashboard",
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
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-10">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-medium text-sky-700">Dental clinic</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-900">
          Doctor sign in
        </h1>
        <p className="mt-2 text-sm text-zinc-600">
          Enter the dashboard password to view today&apos;s appointments.
        </p>

        <form action="/api/auth/login" method="post" className="mt-6 space-y-4">
          <input type="hidden" name="next" value={nextPath} />
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-zinc-700"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoFocus
              autoComplete="current-password"
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-100"
            />
          </div>

          {error ? (
            <p role="alert" className="text-sm font-medium text-rose-700">
              Incorrect password. Please try again.
            </p>
          ) : null}

          <button
            type="submit"
            className="w-full rounded-lg bg-sky-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-800"
          >
            Open dashboard
          </button>
        </form>
      </div>
    </main>
  );
}
