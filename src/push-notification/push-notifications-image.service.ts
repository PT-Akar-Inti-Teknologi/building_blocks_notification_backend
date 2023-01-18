import { Like, Repository } from 'typeorm';
import { BadRequestException, HttpStatus, Logger } from '@nestjs/common';
import { ErrorMessageInterface } from '../response/response.interface';
import { Readable } from 'stream';
import { InjectRepository } from '@nestjs/typeorm';
import { PushNotificationsDocument } from './entities/push_notifications.entity';
import { ServiceBase } from '../base/service/service.base';
import { MessageService } from '../message/message.service';
import { ResponseService } from '../response/response.service';
import { CommonStorageService } from '../common/storage/storage.service';

export class PushNotificationsImageService extends ServiceBase<PushNotificationsDocument> {
  constructor(
    @InjectRepository(PushNotificationsDocument)
    public repository: Repository<PushNotificationsDocument>,
    private readonly messageService: MessageService,
    private readonly responseService: ResponseService,
    private readonly storage: CommonStorageService,
  ) {
    super(repository);
  }

  private readonly logger = new Logger(PushNotificationsImageService.name);

  async getExt(data) {
    let ext = null;

    let type = null;

    const pushNotification = await this.repository
      .findOne({ id: data.id, image: Like('%' + data.fileName + '%') })
      .catch(() => {
        throw new BadRequestException(
          this.responseService.error(
            HttpStatus.BAD_REQUEST,
            [
              {
                field: 'id',
                message: this.messageService.get(
                  'general.general.dataNotFound',
                ),
              },
            ],
            'Bad Request',
          ),
        );
      });

    if (pushNotification) {
      ext = pushNotification.image.split('.')[pushNotification.image.split('.').length - 1];
      if (ext == 'png' || ext == 'jpg' || ext == 'jpeg' || ext == 'gif') {
        type = 'image';
      }
    }

    return { ext, type };
  }

  async getBufferS3(data: any) {
    let url = null;

    try {
      const pushNotification = await this.repository.findOne({
        id: data.id,
        image: Like('%' + data.fileName + '%'),
      });

      url = pushNotification.image;

      if (!pushNotification) {
        const error: ErrorMessageInterface = {
          field: 'id',
          message: this.messageService.get('general.general.dataNotFound'),
        };

        throw new BadRequestException(
          this.responseService.error(
            HttpStatus.BAD_REQUEST,
            [error],
            'Bad Request',
          ),
        );
      }
    } catch (error) {
      this.logger.log(error);
    }

    return await this.storage.getBuff(url);
  }

  async getReadableStream(buffer: Buffer) {
    const stream = new Readable();

    stream.push(buffer);

    stream.push(null);

    return stream;
  }
}
