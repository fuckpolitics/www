import { Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';

@Injectable()
export class AppService {
  private readonly ROOM_NAME = 'Demo Room';
  private readonly ROOM_SIZE = 7;

  private readonly logger = new Logger(AppService.name);
  private readonly usersSet = new Set<string>();

  joinUser(userId: string) {
    this.logger.log(`Joining user ${userId}`);
    if (this.usersSet.size > this.ROOM_SIZE) {
      throw new RpcException({
        code: status.RESOURCE_EXHAUSTED,
        message: 'Room is full',
      });
    }
    this.usersSet.add(userId);
  }

  leaveUser(userId: string) {
    this.logger.log(`Joining leave ${userId}`);
    this.usersSet.delete(userId);
  }

  getInfo(): { name: string; users: string[] } {
    return {
      name: this.ROOM_NAME,
      users: Array.from(this.usersSet),
    };
  }
}
