import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtGuard } from '../auth/guard/jwt.guard';
import { AccessKeyService } from './access-key.service';
import { UpdateUserDetailsDto } from './dto/update.user.dto';
import { UserDto } from './dto/user.dto';

@Controller('access-key')
@UseGuards(JwtGuard)
export class AccessKeyController {
  constructor(private accessKeyService: AccessKeyService) {}

  @Post('generate-key')
  async generateKey(
    @Req() req,
    @Body()
    reqBody: {
      userEmail: string;
      requestRateLimit: number;
      expirationTimeInSec: number;
    },
  ) {
    const accessKey: string = await this.accessKeyService.generateKey(reqBody);
    return { accessKey };
  }

  @Delete('delete-key')
  async deleteKey(@Body() reqBody: { userEmail: string }) {
    await this.accessKeyService.deleteKey(reqBody.userEmail);
    return { status: 'OK' };
  }

  @Get('get-users-data')
  async getUserData() {
    const userData: UserDto[] = await this.accessKeyService.getUserData();
    return userData;
  }

  @Put('update-key-details')
  async updateKeyDetails(@Body() reqBody: UpdateUserDetailsDto) {
    await this.accessKeyService.updateKeyDetails(reqBody);
    return { status: 'Ok' };
  }
}
