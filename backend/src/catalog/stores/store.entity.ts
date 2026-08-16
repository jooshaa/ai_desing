import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import type { StoreStatus } from '@imora/shared-types';

@Entity({ name: 'stores' })
export class Store {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column('uuid')
  ownerUserId!: string;

  @Column()
  phone!: string;

  @Column()
  region!: string;

  @Column({ type: 'text', array: true, default: [] })
  districts!: string[];

  @Column({ type: 'varchar', default: 'pending' })
  status!: StoreStatus;

  @Column({ type: 'varchar', nullable: true })
  logoUrl!: string | null;
}
