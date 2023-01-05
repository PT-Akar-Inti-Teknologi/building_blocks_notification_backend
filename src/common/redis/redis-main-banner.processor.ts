import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { MainBannersService } from '../../admins-main-banners/main-banners.service';
import { Job } from 'bull';

@Processor('admins')
export class RedisMainBannerProcessor {
  constructor(private readonly mainBannersService: MainBannersService) {}
  private readonly logger = new Logger(RedisMainBannerProcessor.name);

  @Process('autoActiveMainBanner')
  async handleAutoActiveMainBanner(job: Job) {
    try {
      this.logger.debug(
        'AUTO ACTIVE MAIN BANNER QUEUE EXECUTED. ID: ' +
          job.data.main_banner_id,
      );
      await this.mainBannersService.active(job.data.main_banner_id);
    } catch (error) {
      this.logger.error(error.message);
    }
  }

  @Process('autoFinishMainBanner')
  async handleAutoFinishMainBanner(job: Job) {
    try {
      this.logger.debug(
        'AUTO FINISH HOME BANNER QUEUE EXECUTED. ID: ' +
          job.data.main_banner_id,
      );

      await this.mainBannersService.finished(job.data.main_banner_id);
    } catch (error) {
      this.logger.error(error.message);
    }
  }
}
