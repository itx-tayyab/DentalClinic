export type AppointmentStatus = "upcoming" | "now" | "past";
export type AppointmentSource = "bot" | "manual";

export interface Appointment {
  id: string;
  start: string;
  end: string;
  patientName: string;
  phone: string;
  service: string;
  status: AppointmentStatus;
  source?: AppointmentSource;
}

export interface AppointmentsResponse {
  date: string;
  timeZone: string;
  source: "n8n" | "fixtures";
  appointments: Appointment[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isAppointment(value: unknown): value is Appointment {
  if (!isRecord(value)) return false;
  const status = value.status;
  const source = value.source;

  return (
    typeof value.id === "string" &&
    typeof value.start === "string" &&
    typeof value.end === "string" &&
    typeof value.patientName === "string" &&
    typeof value.phone === "string" &&
    typeof value.service === "string" &&
    (status === "upcoming" || status === "now" || status === "past") &&
    (source === undefined || source === "bot" || source === "manual")
  );
}

export function isAppointmentsResponse(
  value: unknown,
): value is AppointmentsResponse {
  if (!isRecord(value) || !Array.isArray(value.appointments)) return false;
  return (
    typeof value.date === "string" &&
    typeof value.timeZone === "string" &&
    (value.source === "n8n" || value.source === "fixtures") &&
    value.appointments.every(isAppointment)
  );
}

export function resolveTimeZone(value: string | undefined): string {
  if (!value) return "UTC";
  try {
    new Intl.DateTimeFormat("en-CA", { timeZone: value });
    return value;
  } catch {
    return "UTC";
  }
}

export function todayInTimeZone(timeZone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function isDateString(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));

  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day
  );
}

/** Returns the requested day, today by default, or null for an invalid date. */
export function resolveRequestedDate(
  query: string | null,
  timeZone: string,
): string | null {
  if (!query) return todayInTimeZone(timeZone);
  return isDateString(query) ? query : null;
}

export function shiftDate(date: string, days: number): string {
  const value = new Date(`${date}T12:00:00Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}

export function formatDateLabel(date: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00Z`));
}

export function formatDateHeading(date: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date(`${date}T00:00:00Z`));
}

export function isSundayDate(date: string): boolean {
  return new Date(`${date}T12:00:00Z`).getUTCDay() === 0;
}

export function isSaturdayDate(date: string): boolean {
  return new Date(`${date}T12:00:00Z`).getUTCDay() === 6;
}

export function getMondayOfWeek(dateStr: string): string {
  const d = new Date(`${dateStr}T12:00:00Z`);
  const day = d.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setUTCDate(d.getUTCDate() + diff);
  return d.toISOString().slice(0, 10);
}

export function getWeekDays(mondayStr: string): string[] {
  const days: string[] = [];
  for (let i = 0; i < 7; i++) {
    days.push(shiftDate(mondayStr, i));
  }
  return days;
}

export function formatDayMonth(dateStr: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    day: "numeric",
    month: "short",
  }).format(new Date(`${dateStr}T12:00:00Z`));
}

export function getDayAbbr(dateStr: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    weekday: "short",
  })
    .format(new Date(`${dateStr}T12:00:00Z`))
    .toUpperCase();
}

export function formatWeekHeading(mondayStr: string, sundayStr: string): string {
  const mon = new Date(`${mondayStr}T12:00:00Z`);
  const sun = new Date(`${sundayStr}T12:00:00Z`);
  const monDay = mon.getUTCDate();
  const sunDay = sun.getUTCDate();
  const month = new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    month: "long",
  }).format(sun);
  const year = sun.getUTCFullYear();

  return `Week of ${monDay} – ${sunDay} ${month} ${year}`;
}

export function formatTime(iso: string, timeZone: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(iso));
}
