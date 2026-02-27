import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Metadata, status } from '@grpc/grpc-js';
import { RpcException } from '@nestjs/microservices';

export const GrpcUserId = createParamDecorator((data: never, ctx: ExecutionContext): string => {
  const metadata = ctx.switchToRpc().getContext<Metadata>();
  const userIdValues = metadata.get('user-id');

  if (!userIdValues || userIdValues.length === 0) {
    throw new RpcException({
      code: status.UNAUTHENTICATED,
      message: 'User ID is missing in metadata',
    });
  }

  return userIdValues[0] as string;
});
