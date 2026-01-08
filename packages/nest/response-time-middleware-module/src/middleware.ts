import type { NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import type { ResponseTimeOptions } from 'response-time';

import { Inject, Injectable } from '@nestjs/common';
import responseTime from 'response-time';

import { MODULE_OPTIONS_TOKEN } from './module';

@Injectable()
export class ResponseTimeMiddleware implements NestMiddleware {
  constructor(
    @Inject(MODULE_OPTIONS_TOKEN) private options: ResponseTimeOptions,
  ) {}
  use(req: Request, res: Response, next: NextFunction): void {
    responseTime(this.options)(req, res, next);
  }
}
