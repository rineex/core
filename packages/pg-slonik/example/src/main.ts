import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = 6500;
  await app.listen(port);
  console.log(`Example app listening on http://localhost:${port}`);
}

bootstrap().catch(console.error);
