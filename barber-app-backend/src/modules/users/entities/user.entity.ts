import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

export enum UserRole {
  ADMIN = 'ADMIN',
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
}
