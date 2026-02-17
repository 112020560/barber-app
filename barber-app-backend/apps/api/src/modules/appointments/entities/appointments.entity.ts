import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { BarberEntity } from '../../barbers/entities/barber.entity';
import { ServiceEntity } from '../../services/entities/service.entity';
import { UserEntity } from '../../users/entities/user.entity';

export enum AppointmentStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
}

@Entity('appointments')
export class AppointmentEntity extends BaseEntity {
  @Column({ name: 'barber_id', type: 'uuid' })
  barberId: string;

  @Column({ name: 'service_id', type: 'uuid' })
  serviceId: string;

  @Column({ name: 'client_id', type: 'uuid' })
  clientId: string;

  @Column({ type: 'timestamptz' })
  date: Date;

  @Column({
    type: 'enum',
    enum: AppointmentStatus,
    default: AppointmentStatus.PENDING,
  })
  status: AppointmentStatus;

  // Relations
  @ManyToOne(() => BarberEntity)
  @JoinColumn({ name: 'barber_id' })
  barber: BarberEntity;

  @ManyToOne(() => ServiceEntity)
  @JoinColumn({ name: 'service_id' })
  service: ServiceEntity;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'client_id' })
  client: UserEntity;
}
