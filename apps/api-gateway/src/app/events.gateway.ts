import {
  ConnectedSocket,
  MessageBody,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { HttpException, Logger } from '@nestjs/common';
import { AppService } from './app.service';
import { MicroserviceRequestDto } from './dto';
import { Socket } from 'socket.io';

@WebSocketGateway()
export class EventsGateway implements OnGatewayDisconnect {
  private readonly logger = new Logger(EventsGateway.name);

  constructor(private readonly appService: AppService) {}

  @SubscribeMessage('call')
  async handleCallEvent(@MessageBody() data: MicroserviceRequestDto, @ConnectedSocket() client: Socket) {
    try {
      this.logger.log('Method called', data);
      const result = await this.appService.callMicroservice(data);

      if (data.service === 'auth' && data.method === 'login' && result.success && result.data) {
        client.data.accessToken = result.data.accessToken;
      }

      return result;
    } catch (error) {
      this.logger.error(error);
      return {
        success: false,
        message: error.message,
        httpStatus: error instanceof HttpException ? error.getStatus() : 500,
      };
    }
  }

  async handleDisconnect(client: Socket) {
    this.logger.log('Socket disconnected.');

    try {
      if (client.data.accessToken) {
        await this.appService.callMicroservice({ service: 'room', method: 'leave', token: client.data.accessToken });
      }
    } catch (error) {
      this.logger.error(error);
    }
  }
}
