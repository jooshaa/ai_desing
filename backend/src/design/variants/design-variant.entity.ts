import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'design_variants' })
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
