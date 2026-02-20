import { Controller, Get, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { MicroservicesService } from './microservices/microservices.service';
import {
  MICROSERVICES_CONFIG,
  normalizeServiceName,
} from '@www/grpc-client';
import { getMethodAccess } from '@www/common';

interface MicroserviceRequestDto {
  service: string;
  method: string;
  data?: any;
  token?: string;
}

@Controller()
export class AppController {
  constructor(
    private readonly microservicesService: MicroservicesService,
  ) {}

  @Post()
  async callMicroservice(@Body() request: MicroserviceRequestDto) {
    try {
      if (!request.service || !request.method) {
        throw new HttpException(
          'Service and method are required',
          HttpStatus.BAD_REQUEST,
        );
      }

      const normalizedServiceName = normalizeServiceName(request.service);
      
      const serviceConfig = MICROSERVICES_CONFIG[normalizedServiceName];
      if (!serviceConfig) {
        throw new HttpException(
          `Service '${request.service}' not found in configuration. Available services: ${Object.keys(MICROSERVICES_CONFIG).join(', ')}`,
          HttpStatus.BAD_REQUEST,
        );
      }

      const access = getMethodAccess(serviceConfig.name, request.method);
      if (access?.isInternal) {
        throw new HttpException('Method is not available via API', HttpStatus.FORBIDDEN);
      }
      if (access?.requiresAuth) {
        if (!request.token) {
          throw new HttpException('Authentication required', HttpStatus.UNAUTHORIZED);
        }
        const validation = await this.microservicesService.validateToken(request.token);
        if (!validation.valid) {
          throw new HttpException('Invalid or expired token', HttpStatus.UNAUTHORIZED);
        }
      }

      const fullMethodName = `${serviceConfig.name}.${request.method}`;

      const data = request.data || {};

      const result = await this.microservicesService.callMicroservice(
        normalizedServiceName,
        fullMethodName,
        data,
      );

      return {
        success: true,
        data: result,
      };
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }

      return {
        success: false,
        error: error.message || 'Unknown error',
      };
    }
  }
}
