import { Module } from '@nestjs/common';
import { SlonikModule } from '@rineex/pg-slonik';
import { createFieldNameTransformationInterceptor } from 'slonik-interceptor-field-name-transformation';

import { AppController } from './app.controller';
import { AppService } from './app.service';

const dsn = 'postgresql://rineex:rineex@localhost:5432/rineex';

@Module({
  imports: [
    SlonikModule.register({
      connections: [
        {
          name: 'DEFAULT',
          dsn,
          options: {
            interceptors: [
              createFieldNameTransformationInterceptor({
                test: field => field.name.startsWith('full_'),
              }),
            ],
          },
        },
      ],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
