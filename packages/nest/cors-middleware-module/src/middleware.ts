import type { NestMiddleware } from '@nestjs/common';
import type { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import type { NextFunction, Request, Response } from 'express';

import { Inject, Injectable } from '@nestjs/common';
import cors from 'cors';

import { MODULE_OPTIONS_TOKEN } from './module';

@Injectable()
export class CorsMiddleware implements NestMiddleware {
  constructor(@Inject(MODULE_OPTIONS_TOKEN) private options: CorsOptions) {}
  use(req: Request, res: Response, next: NextFunction): void {
    cors(this.options)(req, res, next);
  }
}
