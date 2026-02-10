import { Inject } from '@nestjs/common';

import { DEFAULT_POOL_NAME } from './constants';
import { createSlonikToken } from './slonik.util';

/**
 * Parameter decorator that injects the Slonik DatabasePool for the given connection name.
 *
 * @param name - Connection name (default: 'DEFAULT'). Must match a name in SlonikModule.register().
 * @returns Nest parameter decorator that injects DatabasePool.
 *
 * @example
 * constructor(@InjectPool() private readonly pool: DatabasePool) {}
 * constructor(@InjectPool('replica') private readonly replica: DatabasePool) {}
 */
export function InjectPool(name = DEFAULT_POOL_NAME) {
  return Inject(createSlonikToken(name));
}
