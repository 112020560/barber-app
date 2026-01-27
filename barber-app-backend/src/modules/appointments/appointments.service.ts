import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  AppointmentEntity,
  AppointmentStatus,
} from './entities/appointments.entity';
import { Between, In, Repository } from 'typeorm';
import { CreateAppointmentDto } from './dto/create-appointment.dto';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(AppointmentEntity)
    private readonly repo: Repository<AppointmentEntity>,
  ) {}

  async create(dto: CreateAppointmentDto) {
    const date = new Date(dto.date);

    const exists = await this.repo.findOne({
      where: {
        barberId: dto.barberId,
        date,
        status: In([AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED]),
      },
    });

    if (exists) {
      throw new BadRequestException(
        'Barber already has an appointment at this time',
      );
    }

    const entity = this.repo.create({
      ...dto,
      date,
    });

    return this.repo.save(entity);
  }

  async getAgenda(barberId: string, day: string) {
    const start = new Date(`${day}T00:00:00`);
    const end = new Date(`${day}T23:59:59`);

    return this.repo.find({
      where: {
        barberId,
        date: Between(start, end),
      },
      order: { date: 'ASC' },
    });
  }

  async updateStatus(id: string, status: AppointmentStatus) {
    const appointment = await this.repo.findOne({ where: { id } });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    appointment.status = status;
    return this.repo.save(appointment);
  }
}
