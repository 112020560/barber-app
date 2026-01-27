import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateBarberShopDto } from './dto/create-barber-shop.dto';
import { BarberShopEntity } from './entities/barber-shop.entity';

@Injectable()
export class BarberShopsService {
  constructor(
    @InjectRepository(BarberShopEntity)
    private readonly repo: Repository<BarberShopEntity>,
  ) {}

  async create(dto: CreateBarberShopDto) {
    const entity = this.repo.create(dto);
    return this.repo.save(entity);
  }

  async findAll() {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string) {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException('BarberShop not found');
    return entity;
  }
}
