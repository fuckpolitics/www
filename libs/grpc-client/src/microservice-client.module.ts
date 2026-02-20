import { Global, Module } from '@nestjs/common';
import { MicroserviceClientService } from './microservice-client.service';

@Global()
@Module({
  providers: [MicroserviceClientService],
  exports: [MicroserviceClientService],
})
export class MicroserviceClientModule {}
