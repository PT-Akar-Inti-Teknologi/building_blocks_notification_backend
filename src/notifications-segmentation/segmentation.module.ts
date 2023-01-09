import { Module } from '@nestjs/common';
import { SegmentationController } from './segmentation.controller';
import { MessageService } from 'src/message/message.service';
import { ResponseService } from 'src/response/response.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SegmentationService } from './segmentation.service';
import { HashService } from '../hash/hash.service';
import { SegmentationsDocument } from '../database/entities/segmentations.entity';
import { PushNotificationsDocument } from '../database/entities/push_notifications.entity';
import { PushNotificationUsersDocument } from '../database/entities/push_notification_users.entity';
import { PushNotificationClickResponsesDocument } from '../database/entities/push_notification_click_responses.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PushNotificationsDocument,
      PushNotificationUsersDocument,
      PushNotificationClickResponsesDocument,
      SegmentationsDocument,
    ]),
  ],
  controllers: [SegmentationController],
  providers: [
    SegmentationService,
    MessageService,
    ResponseService,
    HashService,
  ],
})
export class SegmentationModule {}
