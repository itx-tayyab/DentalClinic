import { TZDate } from "@date-fns/tz";
import type { Appointment, AppointmentStatus } from "./api";

type JsonRecord = Record<string, unknown>;

interface ParsedSummary {
  patientName: string;
  phone: string;
  service: string;
}

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function statusFor(
  start: Date,
  end: Date,
  now: number,
): AppointmentStatus {
  if (now < start.getTime()) return "upcoming";
  if (now < end.getTime()) return "now";
  return "past";
}

export function findPhone(text: string): string {
  const match = text.match(/\+?\d[\d\s().-]{5,}\d/);
  return match ? match[0].trim() : "";
}

/**
 * Event summaries look like: "Ayesha Khan - +92 300 1234567 (Dental cleaning)".
 * The description also carries the phone number, so it is preferred when present.
 */
export function parseSummary(summary: string): ParsedSummary {
  const labelled = /^\s*(.*?)\s+-\s+(.+?)\s*\(([^()]*)\)\s*$/.exec(summary);

  if (labelled) {
    return {
      patientName: labelled[1].trim() || "Unknown patient",
      phone: findPhone(labelled[2]),
      service: labelled[3].trim() || "Appointment",
    };
  }

  const nameOnly = /^\s*(.*?)\s+-\s+(.+?)\s*$/.exec(summary);
  if (nameOnly) {
    return {
      patientName: nameOnly[1].trim() || "Unknown patient",
      phone: findPhone(nameOnly[2]),
      service: "Appointment",
    };
  }

  return {
    patientName: summary.trim() || "Unknown patient",
    phone: "",
    service: "Appointment",
  };
}

function eventArray(payload: unknown, depth = 0): unknown[] {
  if (Array.isArray(payload)) return payload;
  if (!isRecord(payload) || depth > 2) return [];

  for (const key of ["events", "items", "appointments", "data", "body"]) {
    const value = payload[key];
    if (Array.isArray(value)) return value;
    if (isRecord(value)) {
      const nested = eventArray(value, depth + 1);
      if (nested.length > 0) return nested;
    }
  }

  return [];
}

function timesFrom(event: JsonRecord): { start: Date; end: Date } | null {
  const startNode = isRecord(event.start) ? event.start : null;
  const endNode = isRecord(event.end) ? event.end : null;

  const startRaw =
    asString(startNode?.dateTime) ?? asString(event.start) ?? null;
  if (!startRaw) return null;

  const start = new Date(startRaw);
  if (Number.isNaN(start.getTime())) return null;

  const endRaw = asString(endNode?.dateTime) ?? asString(event.end) ?? null;
  const parsedEnd = endRaw ? new Date(endRaw) : null;
  const end =
    parsedEnd && !Number.isNaN(parsedEnd.getTime())
      ? parsedEnd
      : new Date(start.getTime() + 30 * 60 * 1000);

  return { start, end };
}

/**
 * Normalizes the common shapes an n8n webhook can return:
 * an array of Google Calendar events, or an object wrapping them under
 * events/items/appointments/data/body, including n8n's `{ json: ... }` items.
 */
export function normalizeN8nPayload(
  payload: unknown,
  now = Date.now(),
): Appointment[] {
  const appointments: Appointment[] = [];

  eventArray(payload).forEach((item, index) => {
    const source = isRecord(item) && isRecord(item.json) ? item.json : item;
    if (!isRecord(source)) return;

    const times = timesFrom(source);
    if (!times) return;

    const summary = asString(source.summary) ?? "";
    const description = asString(source.description) ?? "";
    const parsed = parseSummary(summary);
    const phone = findPhone(description) || parsed.phone;
    const id = asString(source.id) ?? `event-${index}`;

    appointments.push({
      id,
      start: times.start.toISOString(),
      end: times.end.toISOString(),
      patientName: parsed.patientName,
      phone,
      service: parsed.service,
      status: statusFor(times.start, times.end, now),
    });
  });

  return appointments.sort(
    (left, right) => Date.parse(left.start) - Date.parse(right.start),
  );
}

interface FixtureItem {
  id: string;
  patientName: string;
  phone: string;
  service: string;
  startTime: string;
  durationMinutes: number;
}

function isFixtureItem(value: unknown): value is FixtureItem {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === "string" &&
    typeof value.patientName === "string" &&
    typeof value.phone === "string" &&
    typeof value.service === "string" &&
    typeof value.startTime === "string" &&
    typeof value.durationMinutes === "number"
  );
}

function fixtureItems(payload: unknown): FixtureItem[] {
  if (!isRecord(payload) || !Array.isArray(payload.appointments)) return [];
  return payload.appointments.filter(isFixtureItem);
}

/** Builds fake appointments for the requested day so the UI works without n8n. */
export function buildFixtureAppointments(
  payload: unknown,
  date: string,
  timeZone: string,
  now = Date.now(),
): Appointment[] {
  const items = fixtureItems(payload);
  if (items.length === 0) {
    throw new Error("Fixture data is missing or malformed");
  }

  const [year, month, day] = date.split("-").map(Number);

  return items
    .map((item) => {
      const [hour, minute] = item.startTime.split(":").map(Number);
      const start = new Date(
        new TZDate(year, month - 1, day, hour, minute, 0, timeZone),
      );
      const end = new Date(
        start.getTime() + item.durationMinutes * 60 * 1000,
      );

      return {
        id: item.id,
        start: start.toISOString(),
        end: end.toISOString(),
        patientName: item.patientName,
        phone: item.phone,
        service: item.service,
        status: statusFor(start, end, now),
      };
    })
    .sort((left, right) => Date.parse(left.start) - Date.parse(right.start));
}
