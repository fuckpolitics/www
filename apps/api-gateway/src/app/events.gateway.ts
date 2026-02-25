import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WsException,
} from '@nestjs/websockets';
import { HttpException, Logger } from '@nestjs/common';
import { AppService } from './app.service';
import { MicroserviceRequestDto } from './dto';

@WebSocketGateway()
export class EventsGateway {
  private readonly logger = new Logger(EventsGateway.name);

  constructor(private readonly appService: AppService) {}

  @SubscribeMessage('call')
  async handleCallEvent(@MessageBody() data: MicroserviceRequestDto) {
    try {
      this.logger.log('Method called', data);
      return await this.appService.callMicroservice(data);
    } catch (error) {
      this.logger.error(error);
      return {
        success: false,
        message: error.message,
        httpStatus: error instanceof HttpException ? error.getStatus() : 500,
      };
    }
  }
}
