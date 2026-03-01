import { Controller, Logger } from '@nestjs/common';
import { AppService } from './app.service';
import {
  CreateUserResponse,
  DeleteUserResponse,
  GetUserResponse,
  UpdateUserResponse,
  UserController,
  UserControllerMethods,
} from '@www/grpc-contracts/generated/user';
import {
  CreateUserRequestDto,
  DeleteUserRequestDto,
  GetUserByEmailRequestDto,
  GetUserRequestDto,
  UpdateUserRequestDto,
} from '@www/common';
import { RpcException } from '@nestjs/microservices';

@Controller()
@UserControllerMethods()
export class AppController implements UserController {
  private readonly logger = new Logger(AppController.name);

  constructor(private readonly appService: AppService) {}

  async createUser(data: CreateUserRequestDto): Promise<CreateUserResponse> {
    this.logger.log(`createUser called with: ${JSON.stringify(data)}`);
    try {
      return await this.appService.createUser(data);
    } catch (error: any) {
      this.logger.error(`Error in createUser:`, error);
      if (error.code === '23505' || error.message?.includes('duplicate') || error.message?.includes('unique')) {
        throw new RpcException({
          code: 6,
          message: `User with email ${data.email} already exists`,
        });
      }
      throw new RpcException({
        code: error.status || 13,
        message: error.message || 'Internal server error',
      });
    }
  }

  async deleteUser(data: DeleteUserRequestDto): Promise<DeleteUserResponse> {
    this.logger.log(`deleteUser called with id: ${data.id}`);
    return await this.appService.deleteUser(data.id);
  }

  async getUser(data: GetUserRequestDto): Promise<GetUserResponse> {
    this.logger.log(`getUser called with id: ${data.id}`);
    return await this.appService.getUser(data.id);
  }

  async getUserByEmail(data: GetUserByEmailRequestDto): Promise<GetUserResponse> {
    this.logger.log(`getUserByEmail called with email: ${data.email}`);
    try {
      return await this.appService.getUserByEmail(data.email);
    } catch (error: any) {
      this.logger.error(`Error in getUserByEmail:`, error);
      if (error.status === 404 || error.message?.includes('not found')) {
        throw new RpcException({
          code: 5,
          message: error.message || `User with email ${data.email} not found`,
        });
      }
      throw new RpcException({
        code: error.status || 13,
        message: error.message || 'Internal server error',
      });
    }
  }

  async updateUser(data: UpdateUserRequestDto): Promise<UpdateUserResponse> {
    this.logger.log(`updateUser called with id: ${data.id}`);
    return await this.appService.updateUser(data);
  }
}
