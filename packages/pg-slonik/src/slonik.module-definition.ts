import { ConfigurableModuleBuilder } from '@nestjs/common';

import type {
  SlonikModuleExtraOptions,
  SlonikModuleOptions,
} from './slonik.interface';

export const {
  ConfigurableModuleClass: SlonikCoreModule,
  MODULE_OPTIONS_TOKEN,
  OPTIONS_TYPE,
  ASYNC_OPTIONS_TYPE,
} = new ConfigurableModuleBuilder<SlonikModuleOptions>()
  .setExtras<SlonikModuleExtraOptions>(
    {
      isGlobal: true,
    },
    (definition, extra) => {
      return { global: extra.isGlobal, ...definition };
    },
  )
  .build();
