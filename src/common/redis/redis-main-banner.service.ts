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
export class RedisMainBannerService {
  constructor(
    @InjectQueue('admins') private readonly queue: Queue,
    private readonly messageService: MessageService,
    private readonly responseService: ResponseService,
  ) {}

  private readonly logger = new Logger(RedisMainBannerService.name);

  async createAutoActiveMainBannerQueue(mainBannerId: string, delay: number) {
    try {
      const queueId = `admins-main-banner-active-${mainBannerId}`;
      this.logger.debug('AUTO ACTIVE MAIN BANNER CREATED. ID: ' + queueId);
      await this.queue.add(
        'autoActiveMainBanner',
        { main_banner_id: mainBannerId },
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

  async createAutoFinishMainBannerQueue(mainBannerId: string, delay: number) {
    try {
      const queueId = `admins-main-banner-finish-${mainBannerId}`;
      this.logger.debug('AUTO FINISH HOME BANNER CREATED. ID: ' + queueId);
      await this.queue.add(
        'autoFinishMainBanner',
        { main_banner_id: mainBannerId },
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

  async deleteAutoActiveMainBannerQueue(mainBannerId: string) {
    try {
      const queueId = `admins-main-banner-start-${mainBannerId}`;
      this.logger.debug('AUTO START HOME BANNER QUEUE DELETED. ID: ' + queueId);
      return await this.queue.removeJobs(queueId);
    } catch (error) {
      this.errorReport(error, 'general.redis.deleteQueueFail');
    }
  }

  async deleteAutoFinishMainBannerQueue(mainBannerId: string) {
    try {
      const queueId = `admins-main-banner-finish-${mainBannerId}`;
      this.logger.debug(
        'AUTO FINISH HOME BANNER QUEUE DELETED. ID: ' + queueId,
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
