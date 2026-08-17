import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'products' })
@Index(['storeId'])
@Index(['categoryId'])
@Index(['isActive'])
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  storeId!: string;

  @Column('uuid')
  categoryId!: string;

  @Column()
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column()
  unit!: string;

  @Column({ type: 'text', array: true, default: [] })
  imageUrls!: string[];

  @Column({ type: 'jsonb', default: {} })
  attributes!: Record<string, unknown>;

  @Column({ default: true })
  isActive!: boolean;
}
