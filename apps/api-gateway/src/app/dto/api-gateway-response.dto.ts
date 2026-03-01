export interface ApiGatewayResponseDto {
  success: boolean;
  message?: string;
  error?: string;
  errorCode?: number;
  data?: unknown;
}
