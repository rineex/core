import { Inject } from '@nestjs/common';

import { DEFAULT_POOL_NAME } from './constants';
import { createSlonikToken } from './slonik.util';

export function InjectPool(name = DEFAULT_POOL_NAME) {
  return Inject(createSlonikToken(name));
}
