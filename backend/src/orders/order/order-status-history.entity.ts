import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';
import type { OrderStatus } from '@imora/shared-types';

@Entity({ name: 'order_status_history' })
export class OrderStatusHistory {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  orderId!: string;

  @Column({ type: 'varchar' })
  oldStatus!: OrderStatus;

  @Column({ type: 'varchar' })
  newStatus!: OrderStatus;

  @Column('uuid')
  actorId!: string;

  @CreateDateColumn()
  createdAt!: Date;
}
