import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'otp_codes' })
export class OtpCode {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  phone!: string;

  @Column()
  code!: string;

  @Column({ type: 'timestamptz' })
  expiresAt!: Date;

  @Column({ default: 0 })
  attempts!: number;
}
