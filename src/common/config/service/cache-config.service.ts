import {
  CacheModuleOptions,
  CacheOptionsFactory,
  CacheStore,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CacheConfig } from '../config.interface';
import { redisStore } from 'cache-manager-redis-store';

@Injectable()
export class CacheConfigService implements CacheOptionsFactory {
  constructor(private configService: ConfigService) {}

  async createCacheOptions(): Promise<CacheModuleOptions> {
    const cacheConfig = this.configService.get<CacheConfig>('cache');
    return {
      ttl: cacheConfig.ttl,
      store: (await redisStore({
        url: this.configService.get('REDIS_URL'),
      })) as unknown as CacheStore,
    };
  }
}
