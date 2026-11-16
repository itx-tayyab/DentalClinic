import { BadRequestException, Injectable } from '@nestjs/common';
import { AppointmentStatus } from '@prisma/client';
import { TZDate } from '@date-fns/tz';
import { PrismaService } from '../prisma/prisma.service';

export interface AppointmentDto {
  id: number;
  patientName: string;
  service: string;
  startsAt: string;
  durationMinutes: number;
  status: AppointmentStatus;
}

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function resolveTimeZone(value: string | undefined): string {
  if (!value) return 'UTC';
  try {
    new Intl.DateTimeFormat('en-CA', { timeZone: value });
    return value;
  } catch {
    return 'UTC';
  }
}

@Injectable()
export class AppointmentsService {
  constructor(private readonly prisma: PrismaService) {}

  todayIn(timeZone: string): string {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date());
  }

  async findForDate(date: string, timeZone: string): Promise<AppointmentDto[]> {
    const start = this.startOfDay(date, timeZone);
    const end = new TZDate(start.getTime(), timeZone);
    end.setDate(end.getDate() + 1);

    const rows = await this.prisma.appointment.findMany({
      where: {
        startsAt: { gte: new Date(start), lt: new Date(end) },
      },
      orderBy: { startsAt: 'asc' },
      select: {
        id: true,
        patientName: true,
        service: true,
        startsAt: true,
        durationMinutes: true,
        status: true,
      },
    });

    return rows.map((row) => ({
      ...row,
      startsAt: row.startsAt.toISOString(),
    }));
  }

  private startOfDay(date: string, timeZone: string): TZDate {
    if (!DATE_PATTERN.test(date)) {
      throw new BadRequestException('date must be in YYYY-MM-DD format');
    }

    const [year, month, day] = date.split('-').map(Number);
    const start = new TZDate(year, month - 1, day, 0, 0, 0, timeZone);
    const formatted = new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(start);

    if (Number.isNaN(start.getTime()) || formatted !== date) {
      throw new BadRequestException('date is not a valid calendar day');
    }

    return start;
  }
}
