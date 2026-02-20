import {
  IsString,
  IsBoolean,
  IsEmail,
  MinLength,
  IsOptional,
} from 'class-validator';

export class RegisterRequest {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password: string;

  @IsString()
  name: string;
}

export class LoginRequest {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

export class ValidateTokenRequest {
  @IsString()
  token: string;
}

export class RefreshTokenRequest {
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

export class LoginResponse {
  @IsBoolean()
  success: boolean;

  @IsString()
  message: string;

  @IsString()
  accessToken: string;

  @IsString()
  refreshToken: string;

  @IsString()
  userId: string;
}

export class ValidateTokenResponse {
  @IsBoolean()
  valid: boolean;

  @IsString()
  userId: string;

  @IsString()
  @IsOptional()
  message?: string;
}

export class RefreshTokenResponse {
  @IsBoolean()
  success: boolean;

  @IsString()
  message: string;

  @IsString()
  accessToken: string;

  @IsString()
  refreshToken: string;
}
