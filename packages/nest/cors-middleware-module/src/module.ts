import type { MiddlewareConsumer, NestModule, Provider } from '@nestjs/common';
import type { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

import { ConfigurableModuleBuilder, HttpStatus, Module } from '@nestjs/common';

import { ALLOWED_HEADERS, ALLOWED_METHODS } from './constant';
import { CorsMiddleware } from './middleware';

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } =
  new ConfigurableModuleBuilder<CorsOptions>().build();

const DEFAULT_CORS_OPTIONS: CorsOptions = {
  credentials: true,
  methods: ALLOWED_METHODS,
  allowedHeaders: ALLOWED_HEADERS,
  preflightContinue: false,

  optionsSuccessStatus: HttpStatus.NO_CONTENT,
};

const MergedCorsOptionsProvider: Provider = {
  provide: MODULE_OPTIONS_TOKEN,
  inject: [MODULE_OPTIONS_TOKEN],
  useFactory: (options: CorsOptions): CorsOptions => ({
    ...DEFAULT_CORS_OPTIONS,
    ...options,
  }),
};

@Module({
  providers: [MergedCorsOptionsProvider],
})
export class CorsModule extends ConfigurableModuleClass implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorsMiddleware).forRoutes('*');
  }
}
