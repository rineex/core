import { TerminusModule } from '@nestjs/terminus';
import { Module } from '@nestjs/common';

import { redisHealthIndicatorProvider } from './redis-health.provider';
import { RedisHealthIndicator } from './redis-health.indicator';

@Module({
  providers: [RedisHealthIndicator, redisHealthIndicatorProvider],
  exports: [RedisHealthIndicator],
  imports: [TerminusModule],
})
export class RedisHealthModule {}
