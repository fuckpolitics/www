import { Controller, Logger } from '@nestjs/common';
import { AppService } from './app.service';
import {
  AuthController,
  AuthControllerMethods,
  LoginResponse,
  RefreshTokenResponse,
  ValidateTokenResponse,
} from '@www/grpc-contracts/generated/auth';
import {
  LoginRequestDto,
  RefreshTokenRequestDto,
  RegisterRequestDto,
  RegisterResponse,
  ValidateTokenRequestDto,
} from '@www/common';
import { RpcException } from '@nestjs/microservices';

@Controller()
@AuthControllerMethods()
export class AppController implements AuthController {
  private readonly logger = new Logger(AppController.name);

  constructor(private readonly appService: AppService) {}

  async login(data: LoginRequestDto): Promise<LoginResponse> {
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

  async refreshToken(data: RefreshTokenRequestDto): Promise<RefreshTokenResponse> {
    this.logger.log(`refreshToken called`);
    return await this.appService.refreshToken(data.refreshToken);
  }

  async register(data: RegisterRequestDto): Promise<RegisterResponse> {
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

  async validateToken(data: ValidateTokenRequestDto): Promise<ValidateTokenResponse> {
    this.logger.log(`validateToken called`);
    return await this.appService.validateToken(data.token);
  }
}
