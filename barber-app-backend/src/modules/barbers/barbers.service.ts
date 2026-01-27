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

@Injectable()
export class BarbersService {
  constructor(
    @InjectRepository(BarberEntity)
    private readonly repo: Repository<BarberEntity>,
  ) {}

  async create(dto: CreateBarberDto) {
    // regla: user no puede ser barbero 2 veces
    const exists = await this.repo.findOne({ where: { userId: dto.userId } });
    if (exists) throw new BadRequestException('User is already a barber');

    const entity = this.repo.create(dto);
    return this.repo.save(entity);
  }

  findAllByBarberShop(barberShopId: string) {
    return this.repo.find({
      where: { barberShopId },
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
}
