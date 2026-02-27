import { Injectable, Logger } from '@nestjs/common';
import { GrpcClientService } from '../grpc/grpc-client.service';
import { normalizeServiceName } from '@www/grpc-client';

@Injectable()
export class MicroservicesService {
  private readonly logger = new Logger(MicroservicesService.name);

  constructor(private readonly grpcClientService: GrpcClientService) {}

  async validateToken(
    token: string,
  ): Promise<{ valid: boolean; userId?: string }> {
    const result = await this.callMicroservice<{
      valid: boolean;
      userId?: string;
    }>(normalizeServiceName('auth'), 'Auth.validateToken', { token }, {});
    return result;
  }

  async callMicroservice<T>(
    serviceName: string,
    method: string,
    data: any,
    metadata: unknown,
  ): Promise<T> {
    this.logger.log(`Calling ${serviceName}.${method} with data:`, data);

    try {
      const result = await this.grpcClientService.callService<T>(
        serviceName,
        method,
        data,
        metadata,
      );

      this.logger.log(`Response from ${serviceName}.${method}:`, result);
      return result;
    } catch (error) {
      this.logger.error(`Error calling ${serviceName}.${method}:`, error);
      throw error;
    }
  }

  async callMicroserviceNative<T>(
    serviceName: string,
    serviceDefinition: string,
    method: string,
    data: any,
  ): Promise<T> {
    this.logger.log(
      `Calling ${serviceName}.${serviceDefinition}.${method} with data:`,
      data,
    );

    try {
      const result = await this.grpcClientService.callGrpcService<T>(
        serviceName,
        serviceDefinition,
        method,
        data,
      );

      this.logger.log(
        `Response from ${serviceName}.${serviceDefinition}.${method}:`,
        result,
      );
      return result;
    } catch (error) {
      this.logger.error(
        `Error calling ${serviceName}.${serviceDefinition}.${method}:`,
        error,
      );
      throw error;
    }
  }
}
