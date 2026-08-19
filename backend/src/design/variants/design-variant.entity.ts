import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'design_variants' })
@Index(['requestId', 'sort'])
export class DesignVariant {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  requestId!: string;

  @Column()
  imageUrl!: string;

  @Column({ default: 0 })
  sort!: number;
}
