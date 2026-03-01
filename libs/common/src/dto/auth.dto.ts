import { IsString, IsBoolean, IsEmail, MinLength, IsOptional } from 'class-validator';
import {
  LoginRequest,
  RefreshTokenRequest,
  RegisterRequest,
  ValidateTokenRequest,
} from '@www/grpc-contracts/generated/auth';

export class RegisterRequestDto implements RegisterRequest {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password: string;

  @IsString()
  name: string;
}

export class LoginRequestDto implements LoginRequest {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

export class ValidateTokenRequestDto implements ValidateTokenRequest {
  @IsString()
  token: string;
}

export class RefreshTokenRequestDto implements RefreshTokenRequest {
  @IsString()
  refreshToken: string;
}

export class RegisterResponse {
  @IsBoolean()
  success: boolean;

  @IsString()
  message: string;

  @IsString()
  userId: string;
}
