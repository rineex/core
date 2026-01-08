import type { MiddlewareConsumer, NestModule } from '@nestjs/common';

import { ConfigurableModuleBuilder, Module } from '@nestjs/common';

import { IgnoreFaviconMiddleware } from './middleware';

export const { ConfigurableModuleClass } =
  new ConfigurableModuleBuilder().build();

@Module({})
export class IgnoreFaviconModule
  extends ConfigurableModuleClass
  implements NestModule
{
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(IgnoreFaviconMiddleware).forRoutes('*');
  }
}
