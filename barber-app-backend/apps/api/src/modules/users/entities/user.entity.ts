import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { BarberShopEntity } from '../../barber-shops/entities/barber-shop.entity';

export enum UserRole {
  ADMIN = 'ADMIN',
  OWNER = 'OWNER',
  BARBER = 'BARBER',
  CLIENT = 'CLIENT',
}

@Entity('users')
export class UserEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 150 })
  name: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 150 })
  email: string;

  @Column({ type: 'varchar', length: 250 })
  passwordHash: string;

  @Column({ type: 'enum', enum: UserRole })
  role: UserRole;

  @Column({ name: 'reset_token', type: 'varchar', nullable: true })
  resetToken: string | null;

  @Column({ name: 'reset_token_expiry', type: 'timestamptz', nullable: true })
  resetTokenExpiry: Date | null;

  // Solo para OWNER - la barbería que gestiona
  @Column({ name: 'barber_shop_id', type: 'uuid', nullable: true })
  barberShopId: string | null;

  @ManyToOne(() => BarberShopEntity, { nullable: true })
  @JoinColumn({ name: 'barber_shop_id' })
  barberShop: BarberShopEntity;
}
