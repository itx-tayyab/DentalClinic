import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { AppointmentsService, resolveTimeZone } from './appointments.service';

@Controller('appointments')
@UseGuards(AuthGuard('jwt'))
export class AppointmentsController {
  constructor(
    private readonly appointmentsService: AppointmentsService,
    private readonly configService: ConfigService,
  ) {}

  @Get()
  async getAppointments(@Query('date') date?: string) {
    const timeZone = resolveTimeZone(
      this.configService.get<string>('CLINIC_TIMEZONE'),
    );
    const day = date ?? this.appointmentsService.todayIn(timeZone);

    return {
      date: day,
      timeZone,
      appointments: await this.appointmentsService.findForDate(day, timeZone),
    };
  }
}
