import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WsException } from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { ApiGatewayRequestDto, ApiGatewayResponseDto } from './dto';
import { Socket } from 'socket.io';
import { lastValueFrom } from 'rxjs';
import { AuthenticateDto } from './dto/authenticate';
import { GrpcGatewayService } from './grpc-gateway/grpc-gateway.service';
import { MethodMetadata } from '@www/grpc-contracts';
import { Metadata } from '@grpc/grpc-js';
import { status } from '@grpc/grpc-js';

@WebSocketGateway()
export class EventsGateway {
  private readonly logger = new Logger(EventsGateway.name);

  constructor(private readonly grpc: GrpcGatewayService) {}

  @SubscribeMessage('call')
  async handleCallEvent(
    @MessageBody() request: ApiGatewayRequestDto,
    @ConnectedSocket() client: Socket,
  ): Promise<ApiGatewayResponseDto> {
    this.logger.log(`Called ${request.service}.${request.method}`, request.data);

    try {
      const contract = this.grpc.getContract(request.service);
      const grpcService = this.grpc.getService(request.service);

      if (!grpcService || !contract) {
        throw new WsException(`Service ${request.service} not found`);
      }

      const methodMetadata = contract.methods[request.method] as MethodMetadata | undefined;

      if (!methodMetadata) {
        throw new WsException(`Method ${request.method} not defined in contract`);
      }

      if (methodMetadata.isInternal) {
        throw new WsException(`Method ${request.method} is not available`);
      }

      if (methodMetadata.requiresAuth && !client.data.userId) {
        throw new WsException(`Unauthorized.`);
      }

      const grpcMetadata = new Metadata();
      grpcMetadata.set('user-id', client.data.userId);

      const result = await lastValueFrom(grpcService[request.method](request.data, grpcMetadata));

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      this.logger.error(error);

      return {
        success: false,
        message: error.details || error.message || 'Internal Error',
        errorCode: error.code,
        error: status[error.code],
      };
    }
  }

  @SubscribeMessage('authenticate')
  async handleAuthenticate(
    @MessageBody() authData: AuthenticateDto,
    @ConnectedSocket() client: Socket,
  ): Promise<ApiGatewayResponseDto> {
    try {
      if (authData.accessToken) {
        const result = await lastValueFrom(this.grpc.authClient.validateToken({ token: authData.accessToken }));
        if (!result.valid) throw new WsException('Unauthorized.');

        client.data.userId = result.userId;
        return {
          success: true,
          data: { accessToken: authData.accessToken, userId: result.userId },
        };
      }

      if (authData.refreshToken) {
        const result = await lastValueFrom(this.grpc.authClient.refreshToken({ refreshToken: authData.refreshToken }));
        if (!result.success) throw new WsException('Unauthorized.');

        return {
          success: true,
          data: { accessToken: result.accessToken, refreshToken: result.refreshToken },
        };
      }

      if (authData.email && authData.password) {
        const result = await lastValueFrom(
          this.grpc.authClient.login({ email: authData.email, password: authData.password }),
        );
        if (!result.success) throw new WsException('Unauthorized.');

        client.data.userId = result.userId;
        return {
          success: true,
          data: { accessToken: result.accessToken, refreshToken: result.refreshToken, userId: result.userId },
        };
      }

      return {
        success: false,
        message: 'Bed request',
      };
    } catch (error) {
      this.logger.error(error);

      return {
        success: false,
        message: error.details || error.message || 'Internal Error',
        errorCode: error.code,
        error: status[error.code],
      };
    }
  }
}
