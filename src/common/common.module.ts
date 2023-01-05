import { Global, Module } from '@nestjs/common';
import { HttpModule, HttpModule as HttpModuleAxios } from '@nestjs/axios';
import { CommonService } from './common.service';
import { MessageService } from 'src/message/message.service';
import { DriverType, StorageModule } from '@codebrew/nestjs-storage';
import { CommonStorageService } from './storage/storage.service';
import { ResponseService } from 'src/response/response.service';
import { BullModule } from '@nestjs/bull';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MainBannersDocument } from 'src/database/entities/main_banners.entity';
import { RedisMainBannerService } from './redis/redis-main-banner.service';
import { RedisMainBannerProcessor } from './redis/redis-main-banner.processor';
import { MainBannersService } from '../admins-main-banners/main-banners.service';
import { RedisPushNotificationsService } from './redis/redis-push-notifications.service';
import { RedisPushNotificationsProcessor } from './redis/redis-push-notifications.processor';

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
    TypeOrmModule.forFeature([MainBannersDocument]),
  ],
  providers: [
    CommonService,
    MessageService,
    CommonStorageService,
    ResponseService,
    RedisMainBannerService,
    RedisMainBannerProcessor,
    MainBannersService,
    RedisPushNotificationsService,
    RedisPushNotificationsProcessor,
  ],
  exports: [
    HttpModule,
    CommonStorageService,
    RedisMainBannerService,
    RedisMainBannerProcessor,
    RedisPushNotificationsService,
    RedisPushNotificationsProcessor,
  ],
})
export class CommonModule {}
