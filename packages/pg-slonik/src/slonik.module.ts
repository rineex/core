import type {
  DynamicModule,
  OnApplicationShutdown,
  Provider,
} from '@nestjs/common';
import type { DatabasePool } from 'slonik';

import { Module } from '@nestjs/common';

import type { OPTIONS_TYPE } from './slonik.module-definition';

import { SlonikCoreModule } from './slonik.module-definition';
import { createSlonikConnection, createSlonikToken } from './slonik.util';

/**
 * NestJS module that provides one or more Slonik PostgreSQL pools as injectable providers.
 * Each connection is created with retries; pools are closed on application shutdown.
 */
@Module({})
export class SlonikModule
  extends SlonikCoreModule
  implements OnApplicationShutdown
{
  private static pools = new Map<string, DatabasePool>();

  /**
   * Registers the module with the given connections. One provider (pool) per connection;
   * inject via InjectPool(name).
   *
   * @param options - Module options; must include connections array.
   * @returns DynamicModule with providers and exports for each connection token.
   */
  static register(options: typeof OPTIONS_TYPE): DynamicModule {
    const { connections } = options;

    const module = super.register(options);

    module.providers ??= [];
    module.exports ??= [];

    const providers: Provider[] = connections.map(conn => ({
      provide: createSlonikToken(conn.name),
      useFactory: async () => {
        const connection = await createSlonikConnection({
          dsn: conn.dsn,
          options: conn.options,
          name: conn.name,
        });
        this.pools.set(conn.name, connection);
        return connection;
      },
    }));

    module.providers.push(...providers);
    module.exports.push(...connections.map(c => createSlonikToken(c.name)));

    return module;
  }

  /** Ends all pools created by this module. Called by Nest on shutdown. */
  async onApplicationShutdown() {
    await Promise.allSettled(
      Array.from(SlonikModule.pools.values()).map(pool => pool.end()),
    );
  }
}
