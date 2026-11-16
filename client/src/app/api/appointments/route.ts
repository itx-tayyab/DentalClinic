import { NextRequest, NextResponse } from "next/server";
import fixtureFile from "../../../../fixtures/appointments.json";
import { resolveRequestedDate, resolveTimeZone } from "@/lib/api";
import type { Appointment } from "@/lib/api";
import {
  buildFixtureAppointments,
  normalizeN8nPayload,
} from "@/lib/appointments";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function fetchFromN8n(date: string): Promise<Appointment[]> {
  const webhookUrl = process.env.N8N_APPOINTMENTS_URL;
  const dashboardKey = process.env.N8N_DASHBOARD_KEY;

  if (!webhookUrl || !dashboardKey) {
    throw new Error("N8N_APPOINTMENTS_URL or N8N_DASHBOARD_KEY is not set");
  }

  const target = new URL(webhookUrl);
  target.searchParams.set("date", date);

  const response = await fetch(target, {
    headers: {
      accept: "application/json",
      "x-dashboard-key": dashboardKey,
    },
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  });

  if (!response.ok) {
    throw new Error(`n8n responded with status ${response.status}`);
  }

  const payload: unknown = await response.json();
  return normalizeN8nPayload(payload);
}

export async function GET(request: NextRequest) {
  const timeZone = resolveTimeZone(process.env.DASHBOARD_TIMEZONE);
  const date = resolveRequestedDate(
    request.nextUrl.searchParams.get("date"),
    timeZone,
  );

  if (!date) {
    return NextResponse.json(
      { message: "date must be a valid YYYY-MM-DD calendar day" },
      { status: 400 },
    );
  }

  const useFixtures = process.env.DASHBOARD_USE_FIXTURES === "true";

  try {
    if (useFixtures) {
      return NextResponse.json({
        date,
        timeZone,
        source: "fixtures",
        appointments: buildFixtureAppointments(fixtureFile, date, timeZone),
      });
    }

    return NextResponse.json({
      date,
      timeZone,
      source: "n8n",
      appointments: await fetchFromN8n(date),
    });
  } catch (error) {
    console.error(
      "Appointments request failed:",
      error instanceof Error ? error.message : "unknown error",
    );
    return NextResponse.json(
      { message: "Appointments are temporarily unavailable." },
      { status: 502 },
    );
  }
}
