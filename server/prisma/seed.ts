/**
 * Development seed data only. Never imported by application code.
 * Creates sample appointments for today in the clinic time zone.
 * Run with: npm run db:seed
 */
import { PrismaClient } from '@prisma/client';
import { TZDate } from '@date-fns/tz';

const prisma = new PrismaClient();

const timeZone = process.env.CLINIC_TIMEZONE ?? 'Asia/Karachi';

function todayIn(timeZoneName: string): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: timeZoneName,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

function at(date: string, time: string): Date {
  return new Date(new TZDate(`${date}T${time}:00`, timeZone));
}

async function main() {
  const existing = await prisma.appointment.count();
  if (existing > 0) {
    console.log(`Skipping seed: ${existing} appointment(s) already exist.`);
    return;
  }

  const today = todayIn(timeZone);

  await prisma.appointment.createMany({
    data: [
      {
        patientName: 'Ayesha Khan',
        service: 'Dental cleaning',
        startsAt: at(today, '09:00'),
        durationMinutes: 30,
        status: 'COMPLETED',
      },
      {
        patientName: 'Bilal Ahmed',
        service: 'Root canal review',
        startsAt: at(today, '09:45'),
        durationMinutes: 45,
        status: 'CONFIRMED',
      },
      {
        patientName: 'Fatima Noor',
        service: 'Composite filling',
        startsAt: at(today, '10:45'),
        durationMinutes: 40,
        status: 'BOOKED',
      },
      {
        patientName: 'Hassan Ali',
        service: 'Braces adjustment',
        startsAt: at(today, '12:00'),
        durationMinutes: 30,
        status: 'BOOKED',
      },
      {
        patientName: 'Sana Iqbal',
        service: 'Tooth extraction',
        startsAt: at(today, '14:30'),
        durationMinutes: 60,
        status: 'CONFIRMED',
      },
      {
        patientName: 'Usman Tariq',
        service: 'Consultation',
        startsAt: at(today, '16:00'),
        durationMinutes: 20,
        status: 'CANCELLED',
      },
    ],
  });

  console.log(`Seeded 6 appointments for ${today} (${timeZone}).`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
