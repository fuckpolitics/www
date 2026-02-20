import { Injectable, Logger, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import {
  RegisterRequest,
  RegisterResponse,
  LoginRequest,
  LoginResponse,
  ValidateTokenResponse,
  RefreshTokenResponse,
  Microservices,
} from '@www/common';
import { MicroserviceClientService } from '@www/grpc-client';
import { AuthCredential, RefreshToken } from '@www/common';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly microserviceClient: MicroserviceClientService,
    @InjectRepository(AuthCredential)
    private readonly authCredentialRepo: Repository<AuthCredential>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepo: Repository<RefreshToken>,
  ) {}

  async register(data: RegisterRequest): Promise<RegisterResponse> {
    this.logger.log(`Registering user: ${data.email}`);

    try {
      this.logger.log(`Checking if user exists: ${data.email}`);
      await this.microserviceClient.call(Microservices.user.getUserByEmail, { email: data.email });
      this.logger.warn(`User already exists: ${data.email}`);
      throw new ConflictException('User with this email already exists');
    } catch (error: any) {
      const errorMessage = error.message || error.toString() || '';
      const errorCode = error.code;

      this.logger.log(`getUserByEmail error - code: ${errorCode}, message: ${errorMessage}`);

      if (errorMessage.includes('not found') || errorCode === 5) {
        this.logger.log(`User not found, creating new user: ${data.email}`);
        try {
          this.logger.log(`Creating user via user-service: ${JSON.stringify({ name: data.name, email: data.email })}`);
          const createUserResponse: any = await this.microserviceClient.call(Microservices.user.createUser, {
            name: data.name,
            email: data.email,
          });

          this.logger.log(`User created successfully: ${JSON.stringify(createUserResponse)}`);

          const hashedPassword = await bcrypt.hash(data.password, 10);
          await this.authCredentialRepo.save({
            email: data.email,
            passwordHash: hashedPassword,
          });

          return {
            success: true,
            message: 'User registered successfully',
            userId: createUserResponse.id,
          };
        } catch (createError: any) {
          this.logger.error(`Error creating user:`, createError);
          this.logger.error(`Create error details - code: ${createError.code}, message: ${createError.message}`);
          throw new ConflictException(
            createError.message || 'Failed to create user',
          );
        }
      }
      if (errorMessage.includes('already exists') || errorCode === 6) {
        throw new ConflictException('User with this email already exists');
      }
      this.logger.error(`Unexpected error in register:`, error);
      this.logger.error(`Error details - code: ${errorCode}, message: ${errorMessage}, stack: ${error.stack}`);
      throw error;
    }
  }

  async login(data: LoginRequest): Promise<LoginResponse> {
    this.logger.log(`Login attempt for: ${data.email}`);

    try {
      this.logger.log(`Fetching user by email: ${data.email}`);
      const user: any = await this.microserviceClient.call(Microservices.user.getUserByEmail, { email: data.email });
      this.logger.log(`User found: ${JSON.stringify({ id: user.id, email: user.email })}`);

      const credential = await this.authCredentialRepo.findOne({ where: { email: data.email } });
      this.logger.log(`Password hash exists: ${!!credential}`);
      if (!credential) {
        this.logger.warn(`No password hash found for email: ${data.email}`);
        throw new UnauthorizedException('Invalid email or password');
      }

      this.logger.log(`Comparing password...`);
      const isPasswordValid = await bcrypt.compare(data.password, credential.passwordHash);
      this.logger.log(`Password valid: ${isPasswordValid}`);
      if (!isPasswordValid) {
        this.logger.warn(`Invalid password for email: ${data.email}`);
        throw new UnauthorizedException('Invalid email or password');
      }

      const payload: Record<string, any> = { sub: user.id, email: user.email };
      const accessToken = this.jwtService.sign(payload);
      const refreshTokenExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
      const refreshToken = this.jwtService.sign(payload, {
        expiresIn: refreshTokenExpiresIn,
      } as any);

      const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
      await this.refreshTokenRepo.save({
        token: refreshToken,
        userId: user.id,
        expiresAt,
      });

      return {
        success: true,
        message: 'Login successful',
        accessToken,
        refreshToken,
        userId: user.id,
      };
    } catch (error: any) {
      if (error.message && error.message.includes('not found')) {
        throw new UnauthorizedException('Invalid email or password');
      }
      throw error;
    }
  }

  async validateToken(token: string): Promise<ValidateTokenResponse> {
    this.logger.log(`Validating token`);

    try {
      const payload = this.jwtService.verify(token);
      return {
        valid: true,
        userId: payload.sub,
        message: 'Token is valid',
      };
    } catch (error: any) {
      this.logger.warn(`Token validation failed: ${error.message}`);
      return {
        valid: false,
        userId: '',
        message: error.message || 'Invalid token',
      };
    }
  }

  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    this.logger.log(`Refreshing token`);

    try {
      const tokenEntity = await this.refreshTokenRepo.findOne({ where: { token: refreshToken } });
      if (!tokenEntity) {
        return {
          success: false,
          message: 'Invalid refresh token',
          accessToken: '',
          refreshToken: '',
        };
      }

      if (tokenEntity.expiresAt < Date.now()) {
        await this.refreshTokenRepo.remove(tokenEntity);
        return {
          success: false,
          message: 'Refresh token expired',
          accessToken: '',
          refreshToken: '',
        };
      }

      const payload = this.jwtService.verify(refreshToken);

      const newPayload: Record<string, any> = { sub: payload.sub, email: payload.email };
      const newAccessToken = this.jwtService.sign(newPayload);
      const refreshTokenExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
      const newRefreshToken = this.jwtService.sign(newPayload, {
        expiresIn: refreshTokenExpiresIn,
      } as any);

      const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
      await this.refreshTokenRepo.remove(tokenEntity);
      await this.refreshTokenRepo.save({
        token: newRefreshToken,
        userId: payload.sub,
        expiresAt,
      });

      return {
        success: true,
        message: 'Token refreshed successfully',
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error: any) {
      this.logger.warn(`Token refresh failed: ${error.message}`);
      return {
        success: false,
        message: error.message || 'Invalid refresh token',
        accessToken: '',
        refreshToken: '',
      };
    }
  }
}
