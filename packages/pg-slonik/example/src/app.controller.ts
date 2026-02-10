import { Controller, Get } from '@nestjs/common';

import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('fields')
  getFieldNameDemo() {
    return this.appService.getFieldNameDemo();
  }

  @Get('health')
  getHealth() {
    return this.appService.getHealth();
  }

  @Get()
  getHello(): string {
    return 'Pg-Slonik example. Try GET /health to hit the database.';
  }
}
