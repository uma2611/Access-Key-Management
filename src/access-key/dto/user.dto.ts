import { IsNumber, IsString } from 'class-validator';

export class UserDto {
  @IsString()
  userEmail: string;

  @IsNumber()
  requestRateLimit: number;

  @IsString()
  expirationTimeInSec: number;
}
