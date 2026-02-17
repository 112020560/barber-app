import { Module } from '@nestjs/common';
import { BarberShopsController } from './barber-shops.controller';
import { BarberShopsService } from './barber-shops.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BarberShopEntity } from './entities/barber-shop.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BarberShopEntity])],
  controllers: [BarberShopsController],
  providers: [BarberShopsService],
  exports: [TypeOrmModule],
})
export class BarberShopsModule {}
