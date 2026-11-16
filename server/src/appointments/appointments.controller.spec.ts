import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AppointmentsController } from './appointments.controller';
import { AppointmentsService } from './appointments.service';

describe('AppointmentsController', () => {
  let controller: AppointmentsController;
  const findForDate = jest.fn();
  const todayIn = jest.fn();

  beforeEach(async () => {
    findForDate.mockReset().mockResolvedValue([]);
    todayIn.mockReset().mockReturnValue('2026-11-16');

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppointmentsController],
      providers: [
        {
          provide: AppointmentsService,
          useValue: { findForDate, todayIn },
        },
        {
          provide: ConfigService,
          useValue: { get: () => 'Asia/Karachi' },
        },
      ],
    }).compile();

    controller = module.get<AppointmentsController>(AppointmentsController);
  });

  it('defaults to today in the clinic time zone', async () => {
    const result = await controller.getAppointments();

    expect(todayIn).toHaveBeenCalledWith('Asia/Karachi');
    expect(findForDate).toHaveBeenCalledWith('2026-11-16', 'Asia/Karachi');
    expect(result).toEqual({
      date: '2026-11-16',
      timeZone: 'Asia/Karachi',
      appointments: [],
    });
  });

  it('passes an explicit date through', async () => {
    await controller.getAppointments('2026-12-01');

    expect(findForDate).toHaveBeenCalledWith('2026-12-01', 'Asia/Karachi');
  });
});
