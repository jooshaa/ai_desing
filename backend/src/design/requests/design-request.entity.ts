import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';
import type { DesignRequestStatus } from '@imora/shared-types';

@Entity({ name: 'design_requests' })
export class DesignRequest {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  userId!: string;

  @Column()
  inputImageUrl!: string;

  @Column({ type: 'varchar', nullable: true })
  roomType!: string | null;

  @Column()
  style!: string;

  @Column({ type: 'text', nullable: true })
  note!: string | null;

  @Column({ type: 'varchar', default: 'queued' })
  status!: DesignRequestStatus;

  @Column({ type: 'numeric', precision: 12, scale: 4, default: 0 })
  apiCost!: string;

  @CreateDateColumn()
  createdAt!: Date;
}
