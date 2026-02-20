import { Controller, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { AppService } from './app.service';
import {
  CreateUserRequest,
  CreateUserResponse,
  DeleteUserRequest,
  DeleteUserResponse,
  GetUserRequest,
  GetUserByEmailRequest,
  GetUserResponse,
  UpdateUserRequest,
  UpdateUserResponse,
  Grpc,
  Microservices,
} from '@www/common';


@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(private readonly appService: AppService) {}

  @Grpc(Microservices.user.getUser)
  async getUser(data: GetUserRequest): Promise<GetUserResponse> {
    this.logger.log(`getUser called with id: ${data.id}`);
    return await this.appService.getUser(data.id);
  }

  @Grpc(Microservices.user.getUserByEmail)
  async getUserByEmail(data: GetUserByEmailRequest): Promise<GetUserResponse> {
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

  @Grpc(Microservices.user.createUser)
  async createUser(data: CreateUserRequest): Promise<CreateUserResponse> {
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

  @Grpc(Microservices.user.updateUser)
  async updateUser(data: UpdateUserRequest): Promise<UpdateUserResponse> {
    this.logger.log(`updateUser called with id: ${data.id}`);
    return await this.appService.updateUser(data);
  }

  @Grpc(Microservices.user.deleteUser)
  async deleteUser(data: DeleteUserRequest): Promise<DeleteUserResponse> {
    this.logger.log(`deleteUser called with id: ${data.id}`);
    return await this.appService.deleteUser(data.id);
  }
}