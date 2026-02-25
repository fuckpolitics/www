export interface MicroserviceRequestDto {
  service: string;
  method: string;
  data?: any;
  token?: string;
}
