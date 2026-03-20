import {
  BadRequestException,
  ForbiddenException,
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
import { NotificationsService } from '../notifications/notifications.service';
import { BarberEntity } from '../barbers/entities/barber.entity';
import { UserEntity } from '../users/entities/user.entity';
import { ServiceEntity } from '../services/entities/service.entity';
import { JwtPayload } from '../../common/decorators/current-user.decorator';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(AppointmentEntity)
    private readonly repo: Repository<AppointmentEntity>,
    @InjectRepository(BarberEntity)
    private readonly barberRepo: Repository<BarberEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(ServiceEntity)
    private readonly serviceRepo: Repository<ServiceEntity>,
    private readonly notificationsService: NotificationsService,
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

    const saved = await this.repo.save(entity);

    // Emit notification event
    try {
      await this.emitAppointmentCreatedEvent(saved);
    } catch (error) {
      console.error('Error emitting appointment created event:', error);
    }

    return saved;
  }

  async getAgenda(barberId: string, day: string) {
    const start = new Date(`${day}T00:00:00`);
    const end = new Date(`${day}T23:59:59`);

    return this.repo.find({
      where: {
        barberId,
        date: Between(start, end),
      },
      relations: ['service', 'client'],
      order: { date: 'ASC' },
    });
  }

  async updateStatus(id: string, status: AppointmentStatus, currentUser: JwtPayload) {
    const appointment = await this.repo.findOne({
      where: { id },
      relations: [
        'barber',
        'barber.user',
        'barber.barberShop',
        'client',
        'service',
      ],
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    if (currentUser.role === 'CLIENT' && appointment.clientId !== currentUser.userId) {
      throw new ForbiddenException('No puedes modificar citas de otros clientes');
    }

    const previousStatus = appointment.status;
    appointment.status = status;
    const saved = await this.repo.save(appointment);

    let cancelledBy: 'CLIENT' | 'BARBER' | 'OWNER' = 'BARBER';
    if (currentUser.role === 'CLIENT') cancelledBy = 'CLIENT';
    else if (currentUser.role === 'OWNER') cancelledBy = 'OWNER';

    try {
      if (
        status === AppointmentStatus.CONFIRMED &&
        previousStatus !== AppointmentStatus.CONFIRMED
      ) {
        await this.emitAppointmentConfirmedEvent(appointment);
      } else if (status === AppointmentStatus.CANCELLED) {
        await this.emitAppointmentCancelledEvent(appointment, cancelledBy);
      }
    } catch (error) {
      console.error('Error emitting notification event:', error);
    }

    return saved;
  }

  private async emitAppointmentCreatedEvent(appointment: AppointmentEntity) {
    // Load related entities
    const barber = await this.barberRepo.findOne({
      where: { id: appointment.barberId },
      relations: ['user', 'barberShop'],
    });
    const client = await this.userRepo.findOne({
      where: { id: appointment.clientId },
    });
    const service = await this.serviceRepo.findOne({
      where: { id: appointment.serviceId },
    });

    if (!barber || !client || !service) {
      console.error('Missing related entities for notification');
      return;
    }

    await this.notificationsService.notifyAppointmentCreated({
      appointmentId: appointment.id,
      barberId: barber.id,
      barberUserId: barber.userId,
      clientId: client.id,
      clientName: client.name,
      clientEmail: client.email,
      barberName: barber.user.name,
      barberEmail: barber.user.email,
      serviceName: service.name,
      shopName: barber.barberShop.name,
      date: appointment.date,
    });
  }

  private async emitAppointmentConfirmedEvent(appointment: AppointmentEntity) {
    await this.notificationsService.notifyAppointmentConfirmed({
      appointmentId: appointment.id,
      clientId: appointment.client.id,
      clientName: appointment.client.name,
      clientEmail: appointment.client.email,
      barberName: appointment.barber.user.name,
      serviceName: appointment.service.name,
      shopName: appointment.barber.barberShop.name,
      date: appointment.date,
    });
  }

  private async emitAppointmentCancelledEvent(
    appointment: AppointmentEntity,
    cancelledBy: 'CLIENT' | 'BARBER' | 'OWNER',
  ) {
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
      cancelledBy,
    });
  }
}
