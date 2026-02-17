import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';

import { BarberWorkingHourEntity } from './entities/barber-working-hour.entity';
import { BarberTimeBlockEntity } from './entities/barber-time-block.entity';

import { ServiceEntity } from '../services/entities/service.entity';
import {
  AppointmentEntity,
  AppointmentStatus,
} from '../appointments/entities/appointments.entity';
import { CreateTimeBlockDto } from './dtos/create-time-block.dto';
import { UpdateWorkingHourDto } from './dtos/update-working-hour.dto';
import { NotificationsService } from '../notifications/notifications.service';

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

    private readonly notificationsService: NotificationsService,
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

    // lunch block (if defined)
    if (working.lunchStart && working.lunchEnd) {
      const lunchStart = this.mergeDayAndTime(day, working.lunchStart);
      const lunchEnd = this.mergeDayAndTime(day, working.lunchEnd);
      if (lunchEnd > lunchStart) {
        dayBlocks.push({ start: lunchStart, end: lunchEnd });
      }
    }

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

  // =====================
  // TIME BLOCKS CRUD
  // =====================

  async createTimeBlock(dto: CreateTimeBlockDto) {
    const startAt = new Date(dto.startAt);
    const endAt = new Date(dto.endAt);

    if (endAt <= startAt) {
      throw new BadRequestException('endAt must be after startAt');
    }

    // Find appointments that will be affected by this block
    const affectedAppointments = await this.appointmentsRepo.find({
      where: {
        barberId: dto.barberId,
        date: Between(startAt, endAt),
        status: AppointmentStatus.PENDING,
      },
      relations: ['barber', 'barber.user', 'barber.barberShop', 'client', 'service'],
    });

    // Also check CONFIRMED appointments
    const confirmedAppointments = await this.appointmentsRepo.find({
      where: {
        barberId: dto.barberId,
        date: Between(startAt, endAt),
        status: AppointmentStatus.CONFIRMED,
      },
      relations: ['barber', 'barber.user', 'barber.barberShop', 'client', 'service'],
    });

    const allAffected = [...affectedAppointments, ...confirmedAppointments];

    // Cancel affected appointments and notify
    for (const appointment of allAffected) {
      appointment.status = AppointmentStatus.CANCELLED;
      await this.appointmentsRepo.save(appointment);

      // Emit cancellation notification
      try {
        await this.notificationsService.notifyAppointmentCancelled({
          appointmentId: appointment.id,
          barberId: appointment.barber.id,
          barberUserId: appointment.barber.userId,
          clientId: appointment.client.id,
          clientName: appointment.client.name,
          clientEmail: appointment.client.email,
          barberName: appointment.barber.user.name,
          barberEmail: appointment.barber.user.email,
          serviceName: appointment.service.name,
          shopName: appointment.barber.barberShop.name,
          date: appointment.date,
          cancelledBy: 'BARBER',
        });
      } catch (error) {
        console.error('Error notifying appointment cancellation:', error);
      }
    }

    // Create the time block
    const block = this.blocksRepo.create({
      barberId: dto.barberId,
      startAt,
      endAt,
      reason: dto.reason,
    });

    const saved = await this.blocksRepo.save(block);

    return {
      ...saved,
      cancelledAppointments: allAffected.length,
    };
  }

  async getTimeBlocks(barberId: string, from?: string, to?: string) {
    const where: any = { barberId };

    if (from && to) {
      const fromDate = new Date(from);
      const toDate = new Date(`${to}T23:59:59`);
      where.startAt = MoreThanOrEqual(fromDate);
      where.endAt = LessThanOrEqual(toDate);
    } else if (from) {
      where.startAt = MoreThanOrEqual(new Date(from));
    } else if (to) {
      where.endAt = LessThanOrEqual(new Date(`${to}T23:59:59`));
    }

    return this.blocksRepo.find({
      where,
      order: { startAt: 'ASC' },
    });
  }

  async deleteTimeBlock(id: string) {
    const block = await this.blocksRepo.findOne({ where: { id } });
    if (!block) {
      throw new NotFoundException('Time block not found');
    }
    await this.blocksRepo.remove(block);
    return { deleted: true };
  }

  // =====================
  // WORKING HOURS
  // =====================

  async getWorkingHours(barberId: string) {
    return this.workingRepo.find({
      where: { barberId },
      order: { dayOfWeek: 'ASC' },
    });
  }

  async updateWorkingHour(dto: UpdateWorkingHourDto) {
    const working = await this.workingRepo.findOne({
      where: { barberId: dto.barberId, dayOfWeek: dto.dayOfWeek },
    });

    if (!working) {
      throw new NotFoundException(
        `Working hour not found for barber on day ${dto.dayOfWeek}`,
      );
    }

    // Update only provided fields
    if (dto.startTime !== undefined) {
      working.startTime = `${dto.startTime}:00`;
    }
    if (dto.endTime !== undefined) {
      working.endTime = `${dto.endTime}:00`;
    }
    if (dto.isClosed !== undefined) {
      working.isClosed = dto.isClosed;
    }
    if (dto.lunchStart !== undefined) {
      working.lunchStart = dto.lunchStart ? `${dto.lunchStart}:00` : null;
    }
    if (dto.lunchEnd !== undefined) {
      working.lunchEnd = dto.lunchEnd ? `${dto.lunchEnd}:00` : null;
    }

    return this.workingRepo.save(working);
  }
}
