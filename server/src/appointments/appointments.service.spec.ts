import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppointmentsService } from './appointments.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AppointmentsService', () => {
  let service: AppointmentsService;
  const findMany = jest.fn();

  beforeEach(async () => {
    findMany.mockReset();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppointmentsService,
        {
          provide: PrismaService,
          useValue: { appointment: { findMany } },
        },
      ],
    }).compile();

    service = module.get<AppointmentsService>(AppointmentsService);
  });

  it('queries the requested calendar day in the clinic time zone', async () => {
    findMany.mockResolvedValue([]);

    await service.findForDate('2026-11-16', 'Asia/Karachi');

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          startsAt: {
            gte: new Date('2026-11-15T19:00:00.000Z'),
            lt: new Date('2026-11-16T19:00:00.000Z'),
          },
        },
      }),
    );
  });

  it('serializes appointment times as ISO strings', async () => {
    findMany.mockResolvedValue([
      {
        id: 1,
        patientName: 'Ayesha Khan',
        service: 'Dental cleaning',
        startsAt: new Date('2026-11-16T04:00:00.000Z'),
        durationMinutes: 30,
        status: 'BOOKED',
      },
    ]);

    const result = await service.findForDate('2026-11-16', 'Asia/Karachi');

    expect(result).toEqual([
      {
        id: 1,
        patientName: 'Ayesha Khan',
        service: 'Dental cleaning',
        startsAt: '2026-11-16T04:00:00.000Z',
        durationMinutes: 30,
        status: 'BOOKED',
      },
    ]);
  });

  it('rejects malformed or impossible dates', async () => {
    await expect(
      service.findForDate('16-11-2026', 'Asia/Karachi'),
    ).rejects.toBeInstanceOf(BadRequestException);
    await expect(
      service.findForDate('2026-02-31', 'Asia/Karachi'),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
