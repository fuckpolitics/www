import { Controller, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { AppService } from './app.service';
import {
  RegisterRequest,
  RegisterResponse,
  LoginRequest,
  LoginResponse,
  ValidateTokenRequest,
  ValidateTokenResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  Grpc,
  Microservices,
} from '@www/common';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(private readonly appService: AppService) {}

  @Grpc(Microservices.auth.register)
  async register(data: RegisterRequest): Promise<RegisterResponse> {
    this.logger.log(`register called with email: ${data.email}`);
    try {
      return await this.appService.register(data);
    } catch (error: any) {
      this.logger.error(`Error in register:`, error);
      this.logger.error(`Error details - code: ${error.code}, status: ${error.status}, message: ${error.message}`);
      
      if (error.code !== undefined && error.message) {
        throw new RpcException({
          code: error.code || error.status || 13,
          message: error.message || 'Internal server error',
        });
      }
      
      if (error.status === 409 || error.message?.includes('already exists')) {
        throw new RpcException({
          code: 6,
          message: error.message || 'User already exists',
        });
      }
      
      throw new RpcException({
        code: error.status || 13,
        message: error.message || 'Internal server error',
      });
    }
  }

  @Grpc(Microservices.auth.login)
  async login(data: LoginRequest): Promise<LoginResponse> {
    this.logger.log(`login called with email: ${data.email}`);
    try {
      return await this.appService.login(data);
    } catch (error: any) {
      this.logger.error(`Error in login:`, error);
      this.logger.error(`Error details - code: ${error.code}, status: ${error.status}, message: ${error.message}`);
      
      if (error.code !== undefined && error.message) {
        throw new RpcException({
          code: error.code || error.status || 16,
          message: error.message || 'Authentication failed',
        });
      }
      
      if (error.status === 401 || error.message?.includes('Invalid') || error.message?.includes('Unauthorized')) {
        throw new RpcException({
          code: 16,
          message: error.message || 'Invalid email or password',
        });
      }
      
      throw new RpcException({
        code: error.status || 16,
        message: error.message || 'Authentication failed',
      });
    }
  }

  @Grpc(Microservices.auth.validateToken)
  async validateToken(
    data: ValidateTokenRequest,
  ): Promise<ValidateTokenResponse> {
    this.logger.log(`validateToken called`);
    return await this.appService.validateToken(data.token);
  }

  @Grpc(Microservices.auth.refreshToken)
  async refreshToken(
    data: RefreshTokenRequest,
  ): Promise<RefreshTokenResponse> {
    this.logger.log(`refreshToken called`);
    return await this.appService.refreshToken(data.refreshToken);
  }
}
