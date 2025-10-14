// src/services/jwt-blacklist.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtBlacklist } from '../entities/jwt-blacklist.entity';
import { LessThan, Repository } from 'typeorm';

@Injectable()
export class JwtBlacklistService {
  constructor(
    @InjectRepository(JwtBlacklist)
    private blacklistRepo: Repository<JwtBlacklist>,
  ) {}

  async blacklistToken(token: string, expiresAt: number) {
    await this.blacklistRepo.save({ token, expires_at: expiresAt });
  }

  async isTokenBlacklisted(token: string): Promise<boolean> {
    const record = await this.blacklistRepo.findOne({ where: { token } });
    if (!record) return false;
    const now = Math.floor(Date.now() / 1000);
    return now < record.expires_at;
  }

  async cleanupExpired() {
    const now = Math.floor(Date.now() / 1000);
    await this.blacklistRepo.delete({ expires_at: LessThan(now) });
  }
}
