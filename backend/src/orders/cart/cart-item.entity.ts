import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'cart_items' })
export class CartItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  cartId!: string;

  @Column('uuid')
  productId!: string;

  @Column({ type: 'numeric', precision: 12, scale: 3 })
  qty!: string;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  priceSnapshot!: string;
}
