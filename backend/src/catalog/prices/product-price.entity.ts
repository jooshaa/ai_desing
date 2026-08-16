import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'product_prices' })
export class ProductPrice {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  productId!: string;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  price!: string;

  @Column({ default: 'UZS' })
  currency!: string;

  @Column({ type: 'timestamptz' })
  validFrom!: Date;

  @Column({ default: true })
  inStock!: boolean;
}
