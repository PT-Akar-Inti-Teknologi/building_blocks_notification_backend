import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  Req,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { MessageService } from 'src/message/message.service';
import { ResponseService } from 'src/response/response.service';
import { BaseController } from '../base/controller/controller.base';
import { CreatePushNotificationsDto } from './dto/create-push-notifications.dto';
import { UpdatePushNotificationsDto } from './dto/update-push-notifications.dto';
import { PushNotificationsDocument } from '../database/entities/push_notifications.entity';
import { PushNotificationsService } from './push-notifications.service';
import { IndexPushNotificationsDto } from './dto/index-push-notifications.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { editFileName, imageJpgPngFileFilter } from '../utils/general.utils';
import { ImageValidationService } from '../utils/image-validation.service';
import { CommonStorageService } from '../common/storage/storage.service';
import { PushNotificationsImageService } from './push-notifications-image.service';
import { Response } from 'express';
import etag from 'etag';
import { ResponseSuccessSingleInterface } from '../response/response.interface';
import { PaginationTransformer } from '../base/transformers/index.transformer';

@Controller('api/v1/admins/push-notifications')
export class PushNotificationsController extends BaseController<
  CreatePushNotificationsDto,
  UpdatePushNotificationsDto,
  PushNotificationsDocument
> {
  public static UPLOAD_PATH = '/upload_push_notifications/';

  constructor(
    private readonly pushNotificationService: PushNotificationsService,
    private readonly messageService: MessageService,
    private readonly responseService: ResponseService,
    private readonly imageValidationService: ImageValidationService,
    private readonly commonStorageService: CommonStorageService,
    private readonly pushNotificationImageService: PushNotificationsImageService,
  ) {
    super(
      pushNotificationService,
      messageService,
      responseService,
      PushNotificationsController.name,
    );
  }

  @Post()
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: diskStorage({
        destination: './upload_push_notifications',
        filename: editFileName,
      }),
      limits: {
        fileSize: 5242880, //5MB
      },
      fileFilter: imageJpgPngFileFilter,
    }),
  )
  async storeWithImage(
    @Req() req: any,
    @Body() createPushNotificationDto: CreatePushNotificationsDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ResponseSuccessSingleInterface> {
    this.imageValidationService.setFilter('photo', 'required');

    await this.imageValidationService.validate(req);

    try {
      const path_photo =
        PushNotificationsController.UPLOAD_PATH + file.filename;

      createPushNotificationDto.image = await this.commonStorageService.store(
        path_photo,
      );

      const result = await this.pushNotificationService.save(
        createPushNotificationDto,
      );

      this.pushNotificationService.createQueueActiveFinish(result);

      return this.responseService.success(
        result,
        this.messageService.get('general.create.success'),
      );
    } catch (error) {
      throw error;
    }
  }

  @Put('/:id')
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: diskStorage({
        destination: './upload_admins',
        filename: editFileName,
      }),
      limits: {
        fileSize: 5242880, //5MB
      },
      fileFilter: imageJpgPngFileFilter,
    }),
  )
  async updateWithImage(
    @Req() req: any,
    @Param('id') id: string,
    @Body() updatePushNotificationDTO: UpdatePushNotificationsDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ResponseSuccessSingleInterface> {
    if (file) {
      this.imageValidationService.setFilter('photo', 'required');

      await this.imageValidationService.validate(req);

      const path_photo =
        PushNotificationsController.UPLOAD_PATH + file.filename;

      updatePushNotificationDTO.image = await this.commonStorageService.store(
        path_photo,
      );
    }

    try {
      const result = await this.pushNotificationService.save({
        id: id,
        ...updatePushNotificationDTO,
      });

      return this.responseService.success(
        result,
        this.messageService.get('general.create.success'),
      );
    } catch (error) {
      throw error;
    }
  }

  @Get(':id/image/:image')
  async streamFile(
    @Param('id') id: string,
    @Param('image') fileName: string,
    @Res() res: Response,
    @Req() req: any,
  ) {
    let buffer = null;

    let stream = null;

    let format = null;

    const data = { id, fileName };

    try {
      buffer = await this.pushNotificationImageService.getBufferS3(data);

      stream = await this.pushNotificationImageService.getReadableStream(
        buffer,
      );

      format = await this.pushNotificationImageService.getExt(data);
    } catch (error) {
      this.logger.log(error);
    }

    const tag = etag(buffer);

    if (req.headers['if-none-match'] && req.headers['if-none-match'] === tag) {
      throw new HttpException('Not Modified', HttpStatus.NOT_MODIFIED);
    }

    res.set({
      'Content-Type': format.type + '/' + format.ext,
      'Content-Length': buffer.length,
      ETag: tag,
    });

    stream.pipe(res);
  }

  @Get()
  async index(@Query() params: IndexPushNotificationsDto) {
    try {
      const result: PaginationTransformer<PushNotificationsDocument> =
        await this.pushNotificationService.paginate(params);

      return this.responseService.successCollection(
        result.items,
        {
          page: result.current_page,
          size: result.limit,
          total: result.total_item,
        },
        this.messageService.get('general.list.success'),
      );
    } catch (e) {
      this.logger.error(e.message);

      throw new BadRequestException(e.message);
    }
  }

  @Put('/:id/activate')
  async activate(@Param('id') id: string) {
    const result: PushNotificationsDocument =
      await this.pushNotificationService.findOne(id);

    if (!result) {
      throw new NotFoundException(
        this.messageService.get('general.dataNotFound.message'),
      );
    }

    Object.assign(result, {
      is_active: true,
    });

    return this.responseService.success(
      await this.pushNotificationService.save(result),
      this.messageService.get('general.list.success'),
    );
  }

  @Put('/:id/deactivate')
  async deactivate(@Param('id') id: string) {
    const result: PushNotificationsDocument =
      await this.pushNotificationService.findOne(id);

    if (!result) {
      throw new NotFoundException(
        this.messageService.get('general.dataNotFound.message'),
      );
    }

    Object.assign(result, {
      is_active: false,
    });

    return this.responseService.success(
      await this.pushNotificationService.save(result),
      this.messageService.get('general.list.success'),
    );
  }
}
