import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { BarberWorkingHourEntity } from './entities/barber-working-hour.entity';
import { BarberTimeBlockEntity } from './entities/barber-time-block.entity';

import { ServiceEntity } from '../services/entities/service.entity';
import {
  AppointmentEntity,
  AppointmentStatus,
} from '../appointments/entities/appointments.entity';

@Injectable()
export class AvailabilityService {
  private readonly slotMinutes = 30;

  constructor(
    @InjectRepository(BarberWorkingHourEntity)
    private readonly workingRepo: Repository<BarberWorkingHourEntity>,

    @InjectRepository(BarberTimeBlockEntity)
    private readonly blocksRepo: Repository<BarberTimeBlockEntity>,

    @InjectRepository(AppointmentEntity)
    private readonly appointmentsRepo: Repository<AppointmentEntity>,

    @InjectRepository(ServiceEntity)
    private readonly servicesRepo: Repository<ServiceEntity>,
  ) {}

  async getAvailability(barberId: string, serviceId: string, day: string) {
    const service = await this.servicesRepo.findOne({
      where: { id: serviceId },
    });
    if (!service) throw new BadRequestException('Service not found');

    const durationMin = Number(service.durationMin);
    if (!durationMin || durationMin <= 0)
      throw new BadRequestException('Invalid service duration');

    // day range in local time
    const startDay = new Date(`${day}T00:00:00`);
    const endDay = new Date(`${day}T23:59:59`);

    const dow = startDay.getDay(); // 0-6

    const working = await this.workingRepo.findOne({
      where: { barberId, dayOfWeek: dow },
    });

    if (!working || working.isClosed) {
      return { day, slots: [] };
    }

    const workStart = this.mergeDayAndTime(day, working.startTime);
    const workEnd = this.mergeDayAndTime(day, working.endTime);

    if (workEnd <= workStart) {
      return { day, slots: [] };
    }

    // blocks
    const blocks = await this.blocksRepo.find({
      where: { barberId },
    });

    const dayBlocks = blocks
      .filter((b) => this.intersects(b.startAt, b.endAt, startDay, endDay))
      .map((b) => ({ start: b.startAt, end: b.endAt }));

    // appointments
    const appointments = await this.appointmentsRepo
      .createQueryBuilder('a')
      .where('a.barber_id = :barberId', { barberId })
      .andWhere('a.date >= :startDay AND a.date <= :endDay', {
        startDay,
        endDay,
      })
      .andWhere('a.status IN (:...statuses)', {
        statuses: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED],
      })
      .getMany();

    const appointmentBlocks = appointments.map((a) => ({
      start: new Date(a.date),
      end: new Date(new Date(a.date).getTime() + durationMin * 60000), // ⚠️ simplificado MVP
    }));

    // all blocked ranges
    const blocked = [...dayBlocks, ...appointmentBlocks];

    // generate slots
    const slots = this.generateSlots(workStart, workEnd, this.slotMinutes);

    // service needs consecutive slots
    const neededSlots = Math.ceil(durationMin / this.slotMinutes);

    const available: string[] = [];

    for (let i = 0; i < slots.length; i++) {
      const start = slots[i];
      const end = new Date(
        start.getTime() + neededSlots * this.slotMinutes * 60000,
      );

      // must fit in work range
      if (end > workEnd) continue;

      // must not intersect blocked ranges
      const conflict = blocked.some((b) =>
        this.intersects(start, end, b.start, b.end),
      );
      if (!conflict) {
        available.push(this.formatHHMM(start));
      }
    }

    return { day, slots: available };
  }

  private generateSlots(start: Date, end: Date, slotMinutes: number): Date[] {
    const out: Date[] = [];
    let t = new Date(start);

    while (t < end) {
      out.push(new Date(t));
      t = new Date(t.getTime() + slotMinutes * 60000);
    }

    return out;
  }

  private mergeDayAndTime(day: string, time: string) {
    // time could be HH:MM:SS
    const hhmm = time.substring(0, 5);
    return new Date(`${day}T${hhmm}:00`);
  }

  private formatHHMM(d: Date) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  private intersects(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) {
    return aStart < bEnd && aEnd > bStart;
  }
}
