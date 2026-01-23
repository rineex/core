import type { MiddlewareConsumer, NestModule } from '@nestjs/common';
import type { ResponseTimeOptions } from 'response-time';

import { ConfigurableModuleBuilder, Module } from '@nestjs/common';

import { ResponseTimeMiddleware } from './middleware';

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } =
  new ConfigurableModuleBuilder<ResponseTimeOptions>().build();

@Module({})
export class ResponseTimeModule
  extends ConfigurableModuleClass
  implements NestModule
{
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ResponseTimeMiddleware).forRoutes('*');
  }
}
