import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { BarberEntity } from '../../barbers/entities/barber.entity';

@Entity('barber_working_hours')
@Index(['barberId', 'dayOfWeek'], { unique: true })
export class BarberWorkingHourEntity extends BaseEntity {
  @Column({ name: 'barber_id', type: 'uuid' })
  barberId: string;

  @ManyToOne(() => BarberEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'barber_id' })
  barber: BarberEntity;

  // 0=Sunday ... 6=Saturday
  @Column({ name: 'day_of_week', type: 'int' })
  dayOfWeek: number;

  @Column({ name: 'start_time', type: 'time' })
  startTime: string; // "09:00:00"

  @Column({ name: 'end_time', type: 'time' })
  endTime: string; // "19:00:00"

  @Column({ name: 'is_closed', type: 'boolean', default: false })
  isClosed: boolean;

  @Column({ name: 'lunch_start', type: 'time', nullable: true })
  lunchStart?: string; // "12:00:00"

  @Column({ name: 'lunch_end', type: 'time', nullable: true })
  lunchEnd?: string; // "13:00:00"
}
