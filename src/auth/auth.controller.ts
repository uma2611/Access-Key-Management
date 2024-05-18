import { Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalGuard } from './guard/local.guard';
import { JwtGuard } from './guard/jwt.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('admin-login')
  @UseGuards(LocalGuard)
  async login(@Req() reqBody) {
    return reqBody.user;
  }

  @Get('status')
  @UseGuards(JwtGuard)
  async status(@Req() req) {
    return req.user;
  }
}
