import { Controller, Post, Body } from '@nestjs/common';
import { MicroserviceRequestDto } from './dto';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post()
  async callMicroservice(@Body() request: MicroserviceRequestDto) {
    return this.appService.callMicroservice(request);
  }
}
