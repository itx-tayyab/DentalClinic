import { AppointmentsDashboard } from "@/components/appointments-dashboard";

export const dynamic = "force-dynamic";

function todayIn(timeZone: string): string {
  try {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
  } catch {
    return new Intl.DateTimeFormat("en-CA", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
  }
}

export default function DashboardPage() {
  const timeZone = process.env.CLINIC_TIMEZONE ?? "UTC";

  return (
    <AppointmentsDashboard
      timeZone={timeZone}
      initialDate={todayIn(timeZone)}
    />
  );
}
