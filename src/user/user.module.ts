import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { RedisModule } from '../redis/redis.module';
import { RedisService } from '../redis/redis.service';

@Module({
  imports: [RedisModule],
  providers: [UserService, RedisService],
  controllers: [UserController],
})
export class UserModule {}
