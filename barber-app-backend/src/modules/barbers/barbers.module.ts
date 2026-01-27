import { Module } from '@nestjs/common';
import { BarbersController } from './barbers.controller';
import { BarbersService } from './barbers.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BarberEntity } from './entities/barber.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BarberEntity])],
  controllers: [BarbersController],
  providers: [BarbersService],
})
export class BarbersModule {}
