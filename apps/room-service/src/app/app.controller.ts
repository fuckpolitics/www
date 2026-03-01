import { AppService } from './app.service';
import { Observable } from 'rxjs';
import { RoomController, RoomControllerMethods, RoomInfoResponse } from '@www/grpc-contracts/generated/room';
import { BaseResponse } from '@www/grpc-contracts/generated/utils';
import { GrpcUserId } from '@www/grpc-client';

@RoomControllerMethods()
export class AppController implements RoomController {
  constructor(private readonly appService: AppService) {}

  getRoomInfo(): Promise<RoomInfoResponse> | Observable<RoomInfoResponse> | RoomInfoResponse {
    const roomInfo = this.appService.getInfo();
    return { success: true, message: 'Info response', ...roomInfo };
  }

  join(@GrpcUserId() userId: string): Promise<BaseResponse> | Observable<BaseResponse> | BaseResponse {
    this.appService.joinUser(userId);
    return { success: true, message: 'Joined' };
  }

  leave(@GrpcUserId() userId: string): Promise<BaseResponse> | Observable<BaseResponse> | BaseResponse {
    this.appService.leaveUser(userId);
    return { success: true, message: 'Leaved' };
  }
}
