// src/entities/jwt-blacklist.entity.ts
import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('jwt_blacklist')
export class JwtBlacklist {
  @PrimaryColumn({ type: 'varchar', length: 512 })
  token: string;

  @Column({ type: 'int', unsigned: true })
  expires_at: number;
}
