import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'order_items' })
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  orderId!: string;

  @Column('uuid')
  productId!: string;

  @Column({ type: 'numeric', precision: 12, scale: 3 })
  qty!: string;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  price!: string;

  @Column()
  productNameSnapshot!: string;
}
