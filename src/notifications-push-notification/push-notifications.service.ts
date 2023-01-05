import { Injectable } from '@nestjs/common';
import { ServiceBase } from '../base/service/service.base';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryBuilderPaginationUtils } from '../utils/query-builder-pagination.utils';
import { PaginationTransformer } from '../base/transformers/index.transformer';
import { IndexPushNotificationsDto } from './dto/index-push-notifications.dto';
import {
  EnumPushNotificationsStatus,
  PushNotificationsDocument,
} from '../database/entities/push_notifications.entity';
import { DateTimeUtils } from '../utils/date-time-utils';
import { RedisPushNotificationsService } from '../common/redis/redis-push-notifications.service';

@Injectable()
export class PushNotificationsService extends ServiceBase<PushNotificationsDocument> {
  private tableAlias = 'push_notifications';

  constructor(
    @InjectRepository(PushNotificationsDocument)
    public repository: Repository<PushNotificationsDocument>,
    public redisPushNotificationService: RedisPushNotificationsService,
  ) {
    super(repository);
  }

  async paginate(
    params: IndexPushNotificationsDto,
  ): Promise<PaginationTransformer<PushNotificationsDocument>> {
    const query: SelectQueryBuilder<PushNotificationsDocument> =
      this.repository.createQueryBuilder(this.tableAlias);

    if (params.search) {
      query.where(`${this.tableAlias}.title ilike :search`, {
        search: `%${params.search}%`,
      });
    }

    const result: PaginationTransformer<PushNotificationsDocument> =
      await new QueryBuilderPaginationUtils<PushNotificationsDocument>().generatePagination(
        query,
        params.perPage,
        params.currentPage,
      );

    return {
      ...result,
      items: result.items?.map((pushNotificationsDocument) => {
        return {
          ...pushNotificationsDocument,
          image: this.formatImageUrl(pushNotificationsDocument),
        };
      }),
    };
  }

  formatImageUrl(pushNotificationsDocument: PushNotificationsDocument): string {
    const imagePath = pushNotificationsDocument.image;

    if (imagePath && !imagePath.includes('dummyimage')) {
      const nameFile = imagePath.split('/')[imagePath.split('/').length - 1];

      return (
        process.env.BASEURL_API +
        '/api/v1/admins/settings/push-notifications/' +
        pushNotificationsDocument.id +
        '/image/' +
        nameFile
      );
    }

    return imagePath;
  }

  async findOne(entityBaseId: string): Promise<PushNotificationsDocument> {
    const result: PushNotificationsDocument = await super.findOne(entityBaseId);

    if (result) {
      Object.assign(result, {
        image: this.formatImageUrl(result),
      });
    }

    return result;
  }

  async active(entityBaseId: string) {
    const result: PushNotificationsDocument = await super.findOne(entityBaseId);

    if (result) {
      await this.save({
        ...result,
        status: EnumPushNotificationsStatus.ACTIVE,
      });
    }
  }

  async finished(entityBaseId: string) {
    const result: PushNotificationsDocument = await super.findOne(entityBaseId);

    if (result) {
      await this.save({
        ...result,
        status: EnumPushNotificationsStatus.ENDED,
      });
    }
  }

  async createQueueActiveFinish(entity: PushNotificationsDocument) {
    const delayActive = DateTimeUtils.nowToDatetimeMilis(entity.start_date);

    const delayFinish = DateTimeUtils.nowToDatetimeMilis(entity.end_date);

    this.redisPushNotificationService.createAutoActivePushNotificationQueue(
      entity.id,
      delayActive,
    );

    this.redisPushNotificationService.createAutoFinishPushNotificationQueue(
      entity.id,
      delayFinish,
    );
  }
}
