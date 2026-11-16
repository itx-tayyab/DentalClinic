import { AppointmentsDashboard } from "@/components/appointments-dashboard";
import { resolveTimeZone, todayInTimeZone } from "@/lib/api";

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  const timeZone = resolveTimeZone(process.env.DASHBOARD_TIMEZONE);

  return (
    <AppointmentsDashboard
      timeZone={timeZone}
      initialDate={todayInTimeZone(timeZone)}
    />
  );
}
