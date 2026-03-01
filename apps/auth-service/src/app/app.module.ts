import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthCredential, RefreshToken } from '@www/common';
import { config } from 'dotenv';
import { resolve } from 'path';
import { GrpcClientModule } from '@www/grpc-client';
import { UserContract } from '@www/grpc-contracts';
import { ConfigModule } from '@nestjs/config';

config({ path: resolve(__dirname, '../../../.env') });

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    GrpcClientModule.register({ contracts: [UserContract] }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'www',
      entities: [AuthCredential, RefreshToken],
      synchronize: false,
      migrationsRun: process.env.DB_MIGRATIONS_RUN === 'true',
      logging: process.env.DB_LOGGING === 'true',
    }),
    TypeOrmModule.forFeature([AuthCredential, RefreshToken]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
      signOptions: {
        expiresIn: (process.env.JWT_EXPIRES_IN || '1h') as any,
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
