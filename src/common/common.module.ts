import { Global, Module } from '@nestjs/common';
import { HttpModule, HttpModule as HttpModuleAxios } from '@nestjs/axios';
import { CommonService } from './common.service';
import { MessageService } from 'src/message/message.service';
import { DriverType, StorageModule } from '@codebrew/nestjs-storage';
import { CommonStorageService } from './storage/storage.service';
import { ResponseService } from 'src/response/response.service';
import { BullModule } from '@nestjs/bull';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisPushNotificationsService } from './redis/redis-push-notifications.service';
import { RedisPushNotificationsProcessor } from './redis/redis-push-notifications.processor';
import { PushNotificationsService } from '../notifications-push-notification/push-notifications.service';
import { PushNotificationsDocument } from '../database/entities/push_notifications.entity';

@Global()
@Module({
  imports: [
    StorageModule.forRoot({
      default: process.env.STORAGE_S3_STORAGE || 'local',
      disks: {
        local: {
          driver: DriverType.LOCAL,
          config: {
            root: process.cwd(),
          },
        },
        s3: {
          driver: DriverType.S3,
          config: {
            key: process.env.STORAGE_S3_KEY || '',
            secret: process.env.STORAGE_S3_SECRET || '',
            bucket: process.env.STORAGE_S3_BUCKET || '',
            region: process.env.STORAGE_S3_REGION || '',
          },
        },
      },
    }),
    HttpModule,
    HttpModuleAxios,
    BullModule.registerQueue({
      name: 'admins',
    }),
    TypeOrmModule.forFeature([PushNotificationsDocument]),
  ],
  providers: [
    CommonService,
    MessageService,
    CommonStorageService,
    ResponseService,
    RedisPushNotificationsService,
    RedisPushNotificationsProcessor,
    PushNotificationsService,
  ],
  exports: [
    HttpModule,
    CommonStorageService,
    RedisPushNotificationsService,
    RedisPushNotificationsProcessor,
  ],
})
export class CommonModule {}
