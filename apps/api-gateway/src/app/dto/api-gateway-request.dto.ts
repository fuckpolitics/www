import { IsString, IsNotEmpty, IsObject, IsDefined } from 'class-validator';

export class ApiGatewayRequestDto {
  @IsString()
  @IsNotEmpty()
  service: string;

  @IsString()
  @IsNotEmpty()
  method: string;

  @IsDefined()
  @IsObject()
  data: any;
}
