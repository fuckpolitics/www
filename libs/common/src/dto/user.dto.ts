import { IsString, IsOptional, IsUUID } from 'class-validator';
import {
  CreateUserRequest,
  DeleteUserRequest,
  GetUserByEmailRequest,
  GetUserRequest,
  UpdateUserRequest,
} from '@www/grpc-contracts/generated/user';

export class GetUserRequestDto implements GetUserRequest {
  @IsUUID()
  id: string;
}

export class GetUserByEmailRequestDto implements GetUserByEmailRequest {
  @IsString()
  email: string;
}

export class CreateUserRequestDto implements CreateUserRequest {
  @IsString()
  name: string;

  @IsString()
  email: string;
}

export class UpdateUserRequestDto implements UpdateUserRequest {
  @IsUUID()
  id: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  email?: string;
}

export class DeleteUserRequestDto implements DeleteUserRequest {
  @IsUUID()
  id: string;
}
