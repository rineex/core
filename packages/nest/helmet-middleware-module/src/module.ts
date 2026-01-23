import type { MiddlewareConsumer, NestModule } from '@nestjs/common';
import type { HelmetOptions } from 'helmet';

import { ConfigurableModuleBuilder, Module } from '@nestjs/common';

import { HelmetMiddleware } from './middleware';

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } =
  new ConfigurableModuleBuilder<HelmetOptions>().build();

@Module({})
export class HelmetModule
  extends ConfigurableModuleClass
  implements NestModule
{
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HelmetMiddleware).forRoutes('*');
  }
}
