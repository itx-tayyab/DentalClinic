export type AppointmentStatus =
  | "BOOKED"
  | "CONFIRMED"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW";

export interface Appointment {
  id: number;
  patientName: string;
  service: string;
  startsAt: string;
  durationMinutes: number;
  status: AppointmentStatus;
}

export interface AppointmentsResponse {
  date: string;
  timeZone: string;
  appointments: Appointment[];
}

/** Route the browser to the server through the Next.js proxy (same origin). */
export function apiPath(path: string): string {
  return `/api/proxy/${path.replace(/^\/+/, "")}`;
}
