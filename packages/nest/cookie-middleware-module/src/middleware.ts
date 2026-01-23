import type { NestMiddleware } from '@nestjs/common';
import type { CookieParseOptions } from 'cookie-parser';
import type { NextFunction, Request, Response } from 'express';

import { Inject, Injectable } from '@nestjs/common';
import cookieParser from 'cookie-parser';

import { MODULE_OPTIONS_TOKEN } from './module';

@Injectable()
export class CookieParserMiddleware implements NestMiddleware {
  constructor(
    @Inject(MODULE_OPTIONS_TOKEN)
    private readonly options: CookieParseOptions,
  ) {}
  use(req: Request, res: Response, next: NextFunction): void {
    cookieParser(undefined, this.options)(req, res, next);
  }
}
