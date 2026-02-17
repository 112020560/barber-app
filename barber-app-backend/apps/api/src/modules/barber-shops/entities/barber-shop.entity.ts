import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { BarberEntity } from '../../barbers/entities/barber.entity';
import { ServiceEntity } from '../../services/entities/service.entity';

@Entity('barber_shops')
export class BarberShopEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 150 })
  name: string;

  @Column({ type: 'varchar', length: 250 })
  address: string;

  @Column({ type: 'varchar', length: 30 })
  phone: string;

  @OneToMany(() => ServiceEntity, (x) => x.barberShop)
  services: ServiceEntity[];

  @OneToMany(() => BarberEntity, (x) => x.barberShop)
  barbers: BarberEntity[];
}
