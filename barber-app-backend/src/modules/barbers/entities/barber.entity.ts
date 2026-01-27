import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { UserEntity } from '../../users/entities/user.entity';
import { BarberShopEntity } from '../../barber-shops/entities/barber-shop.entity';

@Entity('barbers')
export class BarberEntity extends BaseEntity {
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @OneToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({ name: 'barber_shop_id', type: 'uuid' })
  barberShopId: string;

  @ManyToOne(() => BarberShopEntity, (x) => x.barbers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'barber_shop_id' })
  barberShop: BarberShopEntity;
}
