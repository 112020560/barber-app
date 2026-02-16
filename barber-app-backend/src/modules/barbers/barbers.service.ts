import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BarberEntity } from './entities/barber.entity';
import { Repository } from 'typeorm';
import { CreateBarberDto } from './dtos/create-barber.dto';
import { UpdateBarberDto } from './dtos/update-barber.dto';
import { BarberWorkingHourEntity } from '../availability/entities/barber-working-hour.entity';

@Injectable()
export class BarbersService {
  constructor(
    @InjectRepository(BarberEntity)
    private readonly repo: Repository<BarberEntity>,
    @InjectRepository(BarberWorkingHourEntity)
    private readonly workingRepo: Repository<BarberWorkingHourEntity>,
  ) {}

  async create(dto: CreateBarberDto) {
    // regla: user no puede ser barbero 2 veces
    const exists = await this.repo.findOne({ where: { userId: dto.userId } });
    if (exists) throw new BadRequestException('User is already a barber');

    const entity = this.repo.create(dto);
    const barber = await this.repo.save(entity);

    await this.seedWorkingHours(barber.id);
  }

  findAllByBarberShop(barberShopId: string) {
    return this.repo.find({
      where: { barberShopId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException('Barber not found');
    return entity;
  }

  async update(id: string, dto: UpdateBarberDto) {
    const entity = await this.findOne(id);
    Object.assign(entity, dto);
    return this.repo.save(entity);
  }

  async remove(id: string) {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
    return { ok: true };
  }

  private async seedWorkingHours(barberId: string) {
    const existing = await this.workingRepo.find({
      where: { barberId },
    });

    // si ya hay 7 días, no hacemos nada
    if (existing.length >= 7) return;

    const existingDays = new Set(existing.map((x) => x.dayOfWeek));

    // 0=Sun ... 6=Sat
    const defaults: Array<Partial<BarberWorkingHourEntity>> = [
      {
        dayOfWeek: 0,
        startTime: '00:00:00',
        endTime: '00:00:00',
        isClosed: true,
      }, // Domingo
      {
        dayOfWeek: 1,
        startTime: '09:00:00',
        endTime: '19:00:00',
        isClosed: false,
      }, // Lunes
      {
        dayOfWeek: 2,
        startTime: '09:00:00',
        endTime: '19:00:00',
        isClosed: false,
      }, // Martes
      {
        dayOfWeek: 3,
        startTime: '09:00:00',
        endTime: '19:00:00',
        isClosed: false,
      }, // Miércoles
      {
        dayOfWeek: 4,
        startTime: '09:00:00',
        endTime: '19:00:00',
        isClosed: false,
      }, // Jueves
      {
        dayOfWeek: 5,
        startTime: '09:00:00',
        endTime: '19:00:00',
        isClosed: false,
      }, // Viernes
      {
        dayOfWeek: 6,
        startTime: '09:00:00',
        endTime: '15:00:00',
        isClosed: false,
      }, // Sábado
    ];

    const toCreate = defaults
      .filter((d) => !existingDays.has(d.dayOfWeek!))
      .map((d) => this.workingRepo.create({ ...d, barberId }));

    if (toCreate.length > 0) {
      await this.workingRepo.save(toCreate);
    }
  }
}
