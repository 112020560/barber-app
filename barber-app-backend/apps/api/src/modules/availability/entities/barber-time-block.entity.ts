import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { BarberEntity } from '../../barbers/entities/barber.entity';

@Entity('barber_time_blocks')
export class BarberTimeBlockEntity extends BaseEntity {
  @Column({ name: 'barber_id', type: 'uuid' })
  barberId: string;

  @ManyToOne(() => BarberEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'barber_id' })
  barber: BarberEntity;

  @Column({ name: 'start_at', type: 'timestamptz' })
  startAt: Date;

  @Column({ name: 'end_at', type: 'timestamptz' })
  endAt: Date;

  @Column({ type: 'varchar', length: 200, nullable: true })
  reason?: string;
}
