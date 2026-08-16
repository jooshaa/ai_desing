import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'categories' })
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', nullable: true })
  parentId!: string | null;

  @Column()
  nameUz!: string;

  @Column()
  nameRu!: string;

  @Column({ unique: true })
  slug!: string;

  @Column({ default: 0 })
  sort!: number;

  @Column({ type: 'varchar', nullable: true })
  icon!: string | null;
}
