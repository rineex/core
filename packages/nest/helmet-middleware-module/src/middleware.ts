import type { NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import type { HelmetOptions } from 'helmet';

import { Inject, Injectable } from '@nestjs/common';
import helmet from 'helmet';

import { MODULE_OPTIONS_TOKEN } from './module';

@Injectable()
export class HelmetMiddleware implements NestMiddleware {
  constructor(@Inject(MODULE_OPTIONS_TOKEN) private options: HelmetOptions) {}
  use(req: Request, res: Response, next: NextFunction): void {
    helmet(this.options)(req, res, next);
  }
}
