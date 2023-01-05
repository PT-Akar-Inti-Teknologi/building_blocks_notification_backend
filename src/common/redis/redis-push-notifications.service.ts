import { InjectQueue } from '@nestjs/bull';
import {
  BadRequestException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Queue } from 'bull';
import { MessageService } from 'src/message/message.service';
import { ResponseService } from 'src/response/response.service';
import { ErrorMessageInterface } from '../../response/response.interface';

@Injectable()
export class RedisPushNotificationsService {
  constructor(
    @InjectQueue('admins') private readonly queue: Queue,
    private readonly messageService: MessageService,
    private readonly responseService: ResponseService,
  ) {}

  private readonly logger = new Logger(RedisPushNotificationsService.name);

  async createAutoActivePushNotificationQueue(
    pushNotificationId: string,
    delay: number,
  ) {
    try {
      const queueId = `admins-push-notification-active-${pushNotificationId}`;
      this.logger.debug('AUTO ACTIVE MAIN BANNER CREATED. ID: ' + queueId);
      await this.queue.add(
        'autoActiveMainBanner',
        { push_notification_id: pushNotificationId },
        {
          delay,
          jobId: queueId,
          backoff: {
            type: 'exponential',
            delay: 60000,
          },
        },
      );
    } catch (error) {
      this.errorReport(error, 'general.redis.createQueueFail');
    }
  }

  async createAutoFinishPushNotificationQueue(
    pushNotificationId: string,
    delay: number,
  ) {
    try {
      const queueId = `admins-push-notification-finish-${pushNotificationId}`;
      this.logger.debug(
        'AUTO FINISH PUSH NOTIFICATION CREATED. ID: ' + queueId,
      );
      await this.queue.add(
        'autoFinishMainBanner',
        { push_notification_id: pushNotificationId },
        {
          delay,
          jobId: queueId,
          backoff: {
            type: 'exponential',
            delay: 60000,
          },
        },
      );
    } catch (error) {
      this.errorReport(error, 'general.redis.createQueueFail');
    }
  }

  async deleteAutoActiveMainBannerQueue(pushNotificationId: string) {
    try {
      const queueId = `admins-push-notification-start-${pushNotificationId}`;
      this.logger.debug(
        'AUTO START PUSH NOTIFICATION QUEUE DELETED. ID: ' + queueId,
      );
      return await this.queue.removeJobs(queueId);
    } catch (error) {
      this.errorReport(error, 'general.redis.deleteQueueFail');
    }
  }

  async deleteAutoFinishMainBannerQueue(pushNotificationId: string) {
    try {
      const queueId = `admins-push-notification-finish-${pushNotificationId}`;
      this.logger.debug(
        'AUTO FINISH PUSH NOTIFICATION QUEUE DELETED. ID: ' + queueId,
      );
      return await this.queue.removeJobs(queueId);
    } catch (error) {
      this.errorReport(error, 'general.redis.deleteQueueFail');
    }
  }

  errorReport(error: any, message: string) {
    this.logger.error(error);

    if (error.message == 'Bad Request Exception') {
      throw error;
    } else {
      const errors: ErrorMessageInterface[] = [
        {
          field: '',
          message: error.message,
        },
        { field: '', message: this.messageService.get(message) },
      ];

      throw new BadRequestException(
        this.responseService.error(
          HttpStatus.BAD_REQUEST,
          errors,
          'Bad Request',
        ),
      );
    }
  }
}
