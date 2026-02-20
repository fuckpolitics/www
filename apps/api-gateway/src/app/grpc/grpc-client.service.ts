import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ClientGrpc, ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';
import { MICROSERVICES_CONFIG, normalizeServiceName, resolveProtoPath } from '@www/grpc-client';
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import * as path from 'path';

@Injectable()
export class GrpcClientService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(GrpcClientService.name);
  private clients: Map<string, ClientProxy> = new Map();
  private grpcClients: Map<string, any> = new Map();

  async onModuleInit() {
    this.logger.log('Initializing gRPC clients...');
  }

  async onModuleDestroy() {
    this.logger.log('Closing gRPC clients...');
    this.clients.forEach((client) => {
      if (client) {
        client.close();
      }
    });
    this.clients.clear();
    this.grpcClients.clear();
  }

  getClient(serviceName: string): ClientGrpc {
    const normalizedName = normalizeServiceName(serviceName);
    
    if (!this.clients.has(normalizedName)) {
      const config = MICROSERVICES_CONFIG[normalizedName];
      if (!config) {
        throw new Error(`Microservice config not found for: ${serviceName} (normalized: ${normalizedName})`);
      }

      const protoPath = resolveProtoPath(config.protoPath);

      const client = ClientProxyFactory.create({
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
      this.logger.log(`gRPC client created for ${normalizedName} at ${config.url}`);
    }

    return this.clients.get(normalizedName) as unknown as ClientGrpc;
  }

  getGrpcClient<T>(serviceName: string, serviceDefinition: string): T {
    const normalizedName = normalizeServiceName(serviceName);
    const key = `${normalizedName}:${serviceDefinition}`;
    
    if (!this.grpcClients.has(key)) {
      const config = MICROSERVICES_CONFIG[normalizedName];
      if (!config) {
        throw new Error(`Microservice config not found for: ${serviceName} (normalized: ${normalizedName})`);
      }

      const protoPath = resolveProtoPath(config.protoPath);

      const packageDefinition = protoLoader.loadSync(protoPath, {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true,
      });

      const proto = grpc.loadPackageDefinition(packageDefinition) as any;
      const service = proto[config.package][serviceDefinition];
      
      if (!service) {
        throw new Error(`Service ${serviceDefinition} not found in package ${config.package}`);
      }

      const client = new service(config.url, grpc.credentials.createInsecure());
      this.grpcClients.set(key, client);
      this.logger.log(`Native gRPC client created for ${normalizedName}.${serviceDefinition} at ${config.url}`);
    }

    return this.grpcClients.get(key) as T;
  }

  async callService<T>(
    serviceName: string,
    method: string,
    data: any,
  ): Promise<T> {
    const client = this.getClient(serviceName);
    const service = client.getService<any>(method.split('.')[0]);
    
    if (!service) {
      throw new Error(`Service method ${method} not found`);
    }

    const methodName = method.split('.').pop()!;
    return new Promise((resolve, reject) => {
      service[methodName](data).subscribe({
        next: (response: T) => resolve(response),
        error: (error: any) => {
          this.logger.error(`gRPC call error for ${serviceName}.${method}:`, error);
          reject(error);
        },
      });
    });
  }

  async callGrpcService<T>(
    serviceName: string,
    serviceDefinition: string,
    method: string,
    data: any,
  ): Promise<T> {
    const client = this.getGrpcClient<any>(serviceName, serviceDefinition);
    
    return new Promise((resolve, reject) => {
      client[method](data, (error: any, response: T) => {
        if (error) {
          this.logger.error(`gRPC call error for ${serviceName}.${serviceDefinition}.${method}:`, error);
          reject(error);
        } else {
          resolve(response);
        }
      });
    });
  }
}
