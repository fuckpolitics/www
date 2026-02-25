import { GrpcMethod } from '@nestjs/microservices';
import { MICROSERVICES } from '../const/microservices';
import type { MethodDescriptor } from '../const/microservices';

export function Grpc(descriptor: MethodDescriptor) {
  return GrpcMethod(descriptor.service, descriptor.method);
}

export { MICROSERVICES as Microservices };
