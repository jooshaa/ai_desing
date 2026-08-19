import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import type { DesignRequestStatus } from '@imora/shared-types';

/**
 * `userId` is a bare uuid column, not a relation to core's `User`: IMORA_TZ
 * §5.2 allows a `ManyToOne` to `User`, but a plain id keeps design migrations
 * runnable before core has shipped its own, which matters while the modules
 * land out of order.
 */
@Entity({ name: 'design_requests' })
@Index(['userId', 'createdAt'])
@Index(['createdAt'])
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

  /**
   * USD booked against this request. Written as the *estimate* when the job is
   * accepted and corrected to actual spend when it finishes, so the daily
   * budget guard can never be beaten by requests that are still in flight.
   */
  @Column({ type: 'numeric', precision: 12, scale: 4, default: 0 })
  apiCost!: string;

  /** Which adapter served it — cost forensics when the bill looks wrong. */
  @Column({ type: 'varchar', default: 'stub' })
  provider!: string;

  @Column({ type: 'varchar', default: 'stub' })
  model!: string;

  /** Populated on failure so the UI can say *why* without reading logs (AC-10). */
  @Column({ type: 'text', nullable: true })
  errorMessage!: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  completedAt!: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;
}
