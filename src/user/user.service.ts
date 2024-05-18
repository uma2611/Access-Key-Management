import { HttpException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserDataDto } from './dto/user.dto';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class UserService {
  constructor(private redis: RedisService) {}

  async getUserData(accessKey: string) {
    try {
      // Get all users email
      const userEmails: string[] = await this.redis.getUserKeys('*key*');

      // Get all users data
      const users: string[] = await this.redis.getDataFormKeys(userEmails);
      const userDetails: UserDataDto[] = users.map((user) => JSON.parse(user));

      let user: UserDataDto;
      for (let index = 0; index < userDetails.length; index += 1) {
        const userDetail: UserDataDto = userDetails[index];
        const isUserExist: boolean = await bcrypt.compare(
          userDetail.userEmail,
          accessKey,
        );
        if (isUserExist) {
          user = userDetail;
        }
      }

      if (!user) {
        throw new HttpException('Invalid access token', 400);
      }

      // Disable the access key
      const key = `key-${user.userEmail}`;
      await this.redis.deleteKey(key);
      return user;
    } catch (err) {
      throw err;
    }
  }
}
