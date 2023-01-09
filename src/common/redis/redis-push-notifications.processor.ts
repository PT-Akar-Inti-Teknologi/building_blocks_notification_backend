import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { PushNotificationsService } from '../../notifications-push-notification/push-notifications.service';
import { Job } from 'bull';

@Processor('admins')
export class RedisPushNotificationsProcessor {
  constructor(
    private readonly pushNotificationsService: PushNotificationsService,
  ) {}
  private readonly logger = new Logger(RedisPushNotificationsProcessor.name);

  @Process('autoActivePushNotification')
  async handleAutoActivePushNotification(job: Job) {
    try {
      this.logger.debug(
        'AUTO ACTIVE PUSH NOTIFICATION QUEUE EXECUTED. ID: ' +
          job.data.push_notification_id,
      );
      await this.pushNotificationsService.active(job.data.push_notification_id);
    } catch (error) {
      this.logger.error(error.message);
    }
  }

  @Process('autoFinishPushNotification')
  async handleAutoFinishPushNotification(job: Job) {
    try {
      this.logger.debug(
        'AUTO FINISH PUSH NOTIFICATION QUEUE EXECUTED. ID: ' +
          job.data.push_notification_id,
      );

      await this.pushNotificationsService.finished(job.data.push_notification_id);
    } catch (error) {
      this.logger.error(error.message);
    }
  }
}
