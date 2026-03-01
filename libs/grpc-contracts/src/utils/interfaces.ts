import { Observable } from 'rxjs';

export interface MethodMetadata {
  requiresAuth?: boolean;
  isInternal?: boolean;
}

export interface BaseContract<TClient> {
  package: string;
  serviceName: string;
  protoPath: string;
  urlConfigKey: string;
  clientToken: string;
  serviceToken: string;
  methods: Record<keyof TClient, MethodMetadata>;
}

export type GrpcClientInstance = Record<string, (...args: any[]) => Observable<unknown>>;
