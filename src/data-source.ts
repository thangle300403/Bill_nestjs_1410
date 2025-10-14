// src/data-source.ts
import { DataSource } from 'typeorm';

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: '',
  database: 'your_db',
  synchronize: false,
  entities: [__dirname + '/entities/*.entity.{ts,js}'],
});
