import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';
import type { OrderStatus } from '@imora/shared-types';

@Entity({ name: 'orders' })
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  userId!: string;

  @Column('uuid')
  storeId!: string;

  @Column('uuid')
  addressId!: string;

  @Column({ type: 'varchar', default: 'NEW' })
  status!: OrderStatus;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  total!: string;

  @Column({ type: 'text', nullable: true })
  note!: string | null;

  @CreateDateColumn()
  createdAt!: Date;
}
