import { Controller, Get, Req } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('fetch-data')
  async getUserData(@Req() req) {
    const accessKey: string = req.headers['access-key'];
    const userDetails = await this.userService.getUserData(accessKey);
    return { userDetails };
  }
}
