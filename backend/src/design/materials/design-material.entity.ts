import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'design_materials' })
export class DesignMaterial {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  variantId!: string;

  @Column()
  tag!: string;

  @Column()
  label!: string;
}
