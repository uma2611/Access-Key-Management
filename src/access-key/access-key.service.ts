import { HttpException, Injectable } from '@nestjs/common';
import { UserDto } from './dto/user.dto';
import * as bcrypt from 'bcrypt';
import { UpdateUserDetailsDto } from './dto/update.user.dto';
import { RedisService } from 'src/redis/redis.service';
import { ProducerService } from 'src/kafka/producer.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AccessKeyService {
  constructor(
    private redis: RedisService,
    private kafkaProducer: ProducerService,
    private configService: ConfigService,
  ) {}

  async generateKey(reqBody: UserDto): Promise<string> {
    try {
      // Get salt
      const saltOrRounds: number = Number(process.env.SALT_OR_ROUND);

      // Use user email as a password
      const password: string = `${reqBody.userEmail}`;

      // Generate hash
      const hash: string = await bcrypt.hash(password, saltOrRounds);
      const payload: any = { hash, ...reqBody };
      const key = `key-${reqBody.userEmail}`;

      // Store User data in Redis
      await this.redis.setKey(key, JSON.stringify(payload));
      const expirationTimeInSec: number = reqBody.expirationTimeInSec;

      // Set expiry time
      await this.redis.setKeyExpiryTime(key, expirationTimeInSec);

      // Send genarted access key payload message to microservice 2 through Kafka
      const KafkaMessage = 'genearte key';
      await this.kafkaProducer.produce({
        topic: this.configService.get<string>('KAFKA_TOPIC'),
        messages: [
          {
            value: JSON.stringify({ KafkaMessage, key, ...payload }),
          },
        ],
      });
      return hash;
    } catch (err) {
      throw new HttpException('Unable to generate access key', 400);
    }
  }

  async deleteKey(userEmail: string) {
    try {
      const key = `key-${userEmail}`;

      // Check key exists in Redis
      const keyExists: boolean = await this.redis.keyExists(key);
      if (!keyExists) {
        throw new HttpException('Access key does not exist', 400);
      }

      // Send delete payload message to microservice 2 through Kafka
      const KafkaMessage = 'delete key';
      await this.kafkaProducer.produce({
        topic: this.configService.get<string>('KAFKA_TOPIC'),
        messages: [
          {
            value: JSON.stringify({ KafkaMessage, key }),
          },
        ],
      });
      await this.redis.deleteKey(key);
    } catch (err) {
      throw err;
    }
  }

  async getUserData(): Promise<UserDto[]> {
    try {
      // Get all users data from Redis
      const userDetails: string[] = await this.redis.getUserKeys('*key*');
      if (!userDetails.length) {
        throw new HttpException('User data does not exist', 400);
      }

      // Convert the users data string to JSON
      const data: string[] = await this.redis.getDataFormKeys(userDetails);
      return data.map((x) => JSON.parse(x));
    } catch (err) {
      throw err;
    }
  }

  async updateKeyDetails(reqBody: UpdateUserDetailsDto) {
    try {
      if (!(reqBody.newExpiryTimeInSec && reqBody.newRateLimit)) {
        throw new HttpException(
          'Please provide either new expiry time or new rate limit',
          400,
        );
      }
      const key = `key-${reqBody.userEmail}`;
      // Get the User details
      const user: string = await this.redis.getKey(key);
      if (!user) {
        throw new HttpException('User details does not exist', 400);
      }

      // Set new newExpiryTimeInSec or/and newRateLimit
      const userDetails: UserDto = JSON.parse(user);
      if (reqBody.newExpiryTimeInSec) {
        userDetails.expirationTimeInSec = reqBody.newExpiryTimeInSec;
      }
      if (reqBody.newRateLimit) {
        userDetails.requestRateLimit = reqBody.newRateLimit;
      }

      // Send update payload message to microservice 2 through Kafka
      const KafkaMessage = 'update key';
      await this.kafkaProducer.produce({
        topic: this.configService.get<string>('KAFKA_TOPIC'),
        messages: [
          {
            value: JSON.stringify({ KafkaMessage, key, ...userDetails }),
          },
        ],
      });

      // Set the updated data in Redis
      await this.redis.setKey(key, JSON.stringify(userDetails));

      // Set new expiry time in Redis
      await this.redis.setKeyExpiryTime(key, userDetails.expirationTimeInSec);
    } catch (err) {
      throw err;
    }
  }
}
