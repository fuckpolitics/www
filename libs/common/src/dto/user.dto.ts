import { IsString, IsBoolean, IsNumber, IsOptional, IsUUID } from 'class-validator';

export class GetUserRequest {
  @IsUUID()
  id: string;
}

export class GetUserByEmailRequest {
  @IsString()
  email: string;
}

export class GetUserResponse {
  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsString()
  email: string;

  @IsNumber()
  createdAt: number;
}

export class CreateUserRequest {
  @IsString()
  name: string;

  @IsString()
  email: string;
}

export class CreateUserResponse {
  @IsString()
  id: string;

  @IsBoolean()
  success: boolean;

  @IsString()
  message: string;
}

export class UpdateUserRequest {
  @IsUUID()
  id: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  email?: string;
}

export class UpdateUserResponse {
  @IsBoolean()
  success: boolean;

  @IsString()
  message: string;
}

export class DeleteUserRequest {
  @IsUUID()
  id: string;
}

export class DeleteUserResponse {
  @IsBoolean()
  success: boolean;

  @IsString()
  message: string;
}
