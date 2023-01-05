import { Module } from '@nestjs/common';
import { PushNotificationsController } from './push-notifications.controller';
import { MessageService } from 'src/message/message.service';
import { ResponseService } from 'src/response/response.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PushNotificationsService } from './push-notifications.service';
import { PushNotificationsImageService } from './push-notifications-image.service';
import { ImageValidationService } from '../utils/image-validation.service';
import { HashService } from '../hash/hash.service';
import { PushNotificationsDocument } from '../database/entities/push_notifications.entity';
import { PushNotificationUsersDocument } from '../database/entities/push_notification_users.entity';
import { PushNotificationClickResponsesDocument } from '../database/entities/push_notification_click_responses.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PushNotificationsDocument,
      PushNotificationUsersDocument,
      PushNotificationClickResponsesDocument,
    ]),
  ],
  controllers: [PushNotificationsController],
  providers: [
    PushNotificationsService,
    MessageService,
    ResponseService,
    PushNotificationsImageService,
    ImageValidationService,
    HashService,
  ],
})
export class PushNotificationsModule {}
