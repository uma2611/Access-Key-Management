import { Module } from '@nestjs/common';
import { AccessKeyController } from './access-key.controller';
import { AccessKeyService } from './access-key.service';
import { RedisService } from 'src/redis/redis.service';
import { RedisModule } from 'src/redis/redis.module';
import { ProducerService } from 'src/kafka/producer.service';

@Module({
  imports: [RedisModule],
  providers: [AccessKeyService, RedisService, ProducerService],
  controllers: [AccessKeyController],
})
export class AccessKeyModule {}
