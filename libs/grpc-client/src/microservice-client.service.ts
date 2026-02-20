import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ClientGrpc, ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';
import { MICROSERVICES_CONFIG, normalizeServiceName } from './microservices.config';
import { resolveProtoPath } from './resolve-proto-path';
import * as path from 'path';

@Injectable()
export class MicroserviceClientService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MicroserviceClientService.name);
  /** Кэш gRPC-клиентов по имени сервиса (user, auth). Очищается в onModuleDestroy. */
  private readonly clients = new Map<string, ClientProxy>();
  /** Кэш gRPC-сервисов по ключу "serviceName:serviceDefinition". Очищается в onModuleDestroy. */
  private readonly services = new Map<string, unknown>();

  async onModuleInit() {
    this.logger.log('Initializing universal microservice client...');
  }

  async onModuleDestroy() {
    this.logger.log('Closing microservice clients...');
    this.clients.forEach((client) => {
      if (client) {
        client.close();
      }
    });
    this.clients.clear();
    this.services.clear();
  }

  private getClient(serviceName: string): ClientProxy {
    const normalizedName = normalizeServiceName(serviceName);
    let client = this.clients.get(normalizedName);

    if (!client) {
      const config = MICROSERVICES_CONFIG[normalizedName];
      if (!config) {
        throw new Error(`Microservice config not found for: ${serviceName} (normalized: ${normalizedName})`);
      }

      const protoPath = resolveProtoPath(config.protoPath);

      this.logger.log(`Creating gRPC client for ${normalizedName} at ${config.url}`);

      client = ClientProxyFactory.create({
        transport: Transport.GRPC,
        options: {
          package: config.package,
          protoPath: protoPath,
          url: config.url,
          loader: {
            keepCase: true,
            longs: String,
            enums: String,
            defaults: true,
            arrays: true,
          },
        },
      });

      this.clients.set(normalizedName, client);
      this.logger.log(`✅ gRPC client created for ${normalizedName} at ${config.url}`);
    }

    return client;
  }

  getService<T extends object = any>(serviceName: string, serviceDefinition: string): T {
    const normalizedName = normalizeServiceName(serviceName);
    const key = `${normalizedName}:${serviceDefinition}`;
    let service = this.services.get(key) as T | undefined;

    if (!service) {
      const client = this.getClient(normalizedName);
      const grpcClient = client as unknown as ClientGrpc;
      service = grpcClient.getService<T>(serviceDefinition);

      if (!service) {
        throw new Error(
          `Service ${serviceDefinition} not found in ${normalizedName}. Check proto file and package name.`,
        );
      }

      this.services.set(key, service);
      this.logger.log(`Service ${serviceDefinition} from ${normalizedName} initialized`);
    }

    return service;
  }

  /**
   * Вызов метода микросервиса по дескриптору из Microservices (например Microservices.auth.register).
   */
  async call<T = any>(
    descriptor: { service: string; method: string },
    data: any,
  ): Promise<T> {
    const serviceName = descriptor.service.toLowerCase();
    const { service: serviceDefinition, method } = descriptor;
    const normalizedName = normalizeServiceName(serviceName);
    this.logger.debug(`Calling ${normalizedName}.${serviceDefinition}.${method}`);

    const service = this.getService(serviceName, serviceDefinition);

    if (!service[method]) {
      throw new Error(
        `Method ${method} not found in ${serviceDefinition} service of ${normalizedName}`,
      );
    }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Call to ${normalizedName}.${serviceDefinition}.${method} timed out`));
      }, 30000);

      service[method](data).subscribe({
        next: (response: T) => {
          clearTimeout(timeout);
          resolve(response);
        },
        error: (error: any) => {
          clearTimeout(timeout);
          this.logger.error(
            `Error calling ${normalizedName}.${serviceDefinition}.${method}:`,
            error,
          );

          if (error.code !== undefined) {
            const err = new Error(error.message || 'gRPC call failed');
            (err as any).code = error.code;
            reject(err);
          } else {
            reject(error);
          }
        },
      });
    });
  }
}
