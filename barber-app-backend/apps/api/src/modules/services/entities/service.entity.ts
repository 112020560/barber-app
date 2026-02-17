import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { BarberShopEntity } from '../../barber-shops/entities/barber-shop.entity';

@Entity('services')
export class ServiceEntity extends BaseEntity {
  @Column({ name: 'barber_shop_id', type: 'uuid' })
  barberShopId: string;

  @ManyToOne(() => BarberShopEntity, (x) => x.services, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'barber_shop_id' })
  barberShop: BarberShopEntity;

  @Column({ type: 'varchar', length: 150 })
  name: string;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  price: string; // numeric => string (best practice)

  @Column({ name: 'duration_min', type: 'int' })
  durationMin: number;
}
