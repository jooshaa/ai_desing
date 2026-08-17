import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'product_tags' })
@Index(['productId', 'tag'], { unique: true })
@Index(['tag'])
export class ProductTag {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  productId!: string;

  @Column()
  tag!: string;
}
