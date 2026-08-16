import 'reflect-metadata';
import { DataSource } from 'typeorm';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST ?? 'localhost',
  port: Number(process.env.POSTGRES_PORT ?? 5432),
  username: process.env.POSTGRES_USER ?? 'imora',
  password: process.env.POSTGRES_PASSWORD ?? 'imora',
  database: process.env.POSTGRES_DB ?? 'imora',
  synchronize: false,
  entities: [__dirname + '/**/*.entity.{ts,js}'],
  migrations: [__dirname + '/**/migrations/*.{ts,js}'],
});
