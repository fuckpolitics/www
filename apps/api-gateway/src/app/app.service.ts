import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { MICROSERVICES_CONFIG, normalizeServiceName } from '@www/grpc-client';
import { getMethodAccess } from '@www/common';
import { MicroservicesService } from './microservices/microservices.service';
import { MicroserviceRequestDto } from './dto';

@Injectable()
export class AppService {
  constructor(private readonly microservicesService: MicroservicesService) {}

  async callMicroservice(callMicroserviceDto: MicroserviceRequestDto) {
    try {
      if (!callMicroserviceDto.service || !callMicroserviceDto.method) {
        throw new HttpException(
          'Service and method are required',
          HttpStatus.BAD_REQUEST,
        );
      }

      const normalizedServiceName = normalizeServiceName(
        callMicroserviceDto.service,
      );

      const serviceConfig = MICROSERVICES_CONFIG[normalizedServiceName];
      if (!serviceConfig) {
        throw new HttpException(
          `Service '${callMicroserviceDto.service}' not found in configuration. Available services: ${Object.keys(MICROSERVICES_CONFIG).join(', ')}`,
          HttpStatus.BAD_REQUEST,
        );
      }

      const access = getMethodAccess(
        serviceConfig.name,
        callMicroserviceDto.method,
      );
      if (access?.isInternal) {
        throw new HttpException(
          'Method is not available via API',
          HttpStatus.FORBIDDEN,
        );
      }
      if (access?.requiresAuth) {
        if (!callMicroserviceDto.token) {
          throw new HttpException(
            'Authentication required',
            HttpStatus.UNAUTHORIZED,
          );
        }
        const validation = await this.microservicesService.validateToken(
          callMicroserviceDto.token,
        );
        if (!validation.valid) {
          throw new HttpException(
            'Invalid or expired token',
            HttpStatus.UNAUTHORIZED,
          );
        }
      }

      const fullMethodName = `${serviceConfig.name}.${callMicroserviceDto.method}`;

      const data = callMicroserviceDto.data || {};

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
