import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

/**
 * `tag` shares a namespace with catalog's `ProductTag.tag` so module 3 can join
 * the two (IMORA_TZ §6). Design only emits tags; it never reads catalog.
 */
@Entity({ name: 'design_materials' })
@Index(['variantId'])
@Index(['tag'])
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
