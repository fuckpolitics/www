import { IsString } from "class-validator";

export class TestRequest {
  @IsString()
  name: string;
}

export class TestResponse {
  @IsString()
  message: string;
}