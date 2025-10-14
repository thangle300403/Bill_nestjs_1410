// src/jobs/blacklist-cleanup.job.ts
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { JwtBlacklistService } from '../services/jwt-blacklist.service';

@Injectable()
export class BlacklistCleanupJob {
  constructor(private jwtBlacklistService: JwtBlacklistService) {}

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  @Cron(CronExpression.EVERY_HOUR)
  async handleCleanup() {
    console.log('[CRON] Cleaning up expired tokens...');
    await this.jwtBlacklistService.cleanupExpired();
  }
}
