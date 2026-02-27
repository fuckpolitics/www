import { AppService } from './app.service';
import { Observable } from 'rxjs';
import { RoomController, RoomControllerMethods, RoomInfoResponse } from '@www/common/generated-grpc/room';
import { Empty } from '@www/common/generated-grpc/google/protobuf/empty';
import { BaseResponse } from '@www/common/generated-grpc/utils';
import { GrpcUserId } from '@www/common';

@RoomControllerMethods()
export class AppController implements RoomController {
  constructor(private readonly appService: AppService) {}

  getRoomInfo(
    request: Empty,
    ...rest: any
  ): Promise<RoomInfoResponse> | Observable<RoomInfoResponse> | RoomInfoResponse {
    return undefined;
  }

  join(request: Empty, @GrpcUserId() userId: string): Promise<BaseResponse> | Observable<BaseResponse> | BaseResponse {
    console.log(request, userId);
    return undefined;
  }

  leave(request: Empty, ...rest: any): Promise<BaseResponse> | Observable<BaseResponse> | BaseResponse {
    return undefined;
  }
}
