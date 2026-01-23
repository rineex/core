import type { MiddlewareConsumer, NestModule } from '@nestjs/common';
import type { CookieParseOptions } from 'cookie-parser';

import { ConfigurableModuleBuilder, Module } from '@nestjs/common';

import { CookieParserMiddleware } from './middleware';

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } =
  new ConfigurableModuleBuilder<CookieParseOptions>().build();

@Module({})
export class CookieParserModule
  extends ConfigurableModuleClass
  implements NestModule
{
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CookieParserMiddleware).forRoutes('*');
  }
}
