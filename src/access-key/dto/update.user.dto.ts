import { IsNumber, IsString } from 'class-validator';

export class UpdateUserDetailsDto {
  @IsString()
  userEmail: string;

  @IsNumber()
  newRateLimit?: number;

  @IsNumber()
  newExpiryTimeInSec?: number;
}
