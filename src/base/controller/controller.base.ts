import { ServiceBase } from '../service/service.base';
import { MessageService } from '../../message/message.service';
import { ResponseService } from '../../response/response.service';
import {
  BadRequestException,
  Body,
  Delete,
  Get,
  HttpStatus,
  Logger,
  NotFoundException,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { DeleteResult } from 'typeorm';
import { ErrorMessageInterface } from '../../response/response.interface';

export abstract class BaseController<CreateDTO, UpdateDTO, Model> {
  public readonly logger;

  protected constructor(
    private readonly baseService: ServiceBase<Model>,
    private readonly baseMessageService: MessageService,
    private readonly baseResponseService: ResponseService,
    private readonly className: string,
  ) {
    this.logger = new Logger(this.className);
  }

  @Post()
  async store(@Body() payload: CreateDTO) {
    try {
      const result: Model = await this.baseService.save(payload);

      return this.baseResponseService.success(
        this.formatData(result),
        this.baseMessageService.get('general.create.success'),
      );
    } catch (e) {
      this.logger.error(e.message);

      throw new BadRequestException(e.message);
    }
  }

  @Put('/:id')
  async update(@Param('id') id: string, @Body() payload: UpdateDTO) {
    if (!(await this.baseService.findOne(id))) {
      const error: ErrorMessageInterface = {
        field: 'id',
        message: 'Not Found',
      };

      throw new NotFoundException(
        this.baseResponseService.error(
          HttpStatus.NOT_FOUND,
          [error],
          'Not Found',
        ),
      );
    }

    const result: Model = await this.baseService.update(payload, id);

    return this.baseResponseService.success(
      this.formatData(result),
      this.baseMessageService.get('general.update.success'),
    );
  }

  @Delete('/:id')
  async delete(@Param('id') id: string) {
    if (!(await this.baseService.findOne(id))) {
      const error: ErrorMessageInterface = {
        field: 'id',
        message: 'Not Found',
      };

      throw new NotFoundException(
        this.baseResponseService.error(
          HttpStatus.NOT_FOUND,
          [error],
          'Not Found',
        ),
      );
    }

    const result: DeleteResult = await this.baseService.delete(id);

    return this.baseResponseService.success(
      result,
      this.baseMessageService.get('general.delete.success'),
    );
  }

  @Get('/:id')
  async show(@Param('id') id: string) {
    const result: Model = await this.baseService.findOne(id);

    if (!result) {
      const error: ErrorMessageInterface = {
        field: 'id',
        message: 'Not Found',
      };

      throw new NotFoundException(
        this.baseResponseService.error(
          HttpStatus.NOT_FOUND,
          [error],
          'Not Found',
        ),
      );
    }

    return this.baseResponseService.success(
      this.formatData(result),
      this.baseMessageService.get('general.get.success'),
    );
  }

  formatData(data: Model): Model {
    return data;
  }
}
