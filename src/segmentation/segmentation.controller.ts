import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  Param,
  Put,
  Query,
} from '@nestjs/common';
import { MessageService } from 'src/message/message.service';
import { ResponseService } from 'src/response/response.service';
import { BaseController } from '../base/controller/controller.base';
import { SegmentationService } from './segmentation.service';
import { PaginationTransformer } from '../base/transformers/index.transformer';
import { CreateSegmentationDTO } from './dto/create-segmentation.dto';
import { UpdateSegmentationDTO } from './dto/update-segmentation.dto';
import { SegmentationsDocument } from './entities/segmentations.entity';
import { IndexSegmentationDTO } from './dto/index-segmentation.dto';

@Controller('api/v1/admins/push-notifications')
export class SegmentationController extends BaseController<
  CreateSegmentationDTO,
  UpdateSegmentationDTO,
  SegmentationsDocument
> {
  constructor(
    private readonly segmentationService: SegmentationService,
    private readonly messageService: MessageService,
    private readonly responseService: ResponseService,
  ) {
    super(
      segmentationService,
      messageService,
      responseService,
      SegmentationController.name,
    );
  }

  @Get()
  async index(@Query() params: IndexSegmentationDTO) {
    try {
      const result: PaginationTransformer<SegmentationsDocument> =
        await this.segmentationService.paginate(params);

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
    const result: SegmentationsDocument =
      await this.segmentationService.findOne(id);

    if (!result) {
      throw new NotFoundException(
        this.messageService.get('general.dataNotFound.message'),
      );
    }

    Object.assign(result, {
      is_active: true,
    });

    return this.responseService.success(
      await this.segmentationService.save(result),
      this.messageService.get('general.list.success'),
    );
  }

  @Put('/:id/deactivate')
  async deactivate(@Param('id') id: string) {
    const result: SegmentationsDocument =
      await this.segmentationService.findOne(id);

    if (!result) {
      throw new NotFoundException(
        this.messageService.get('general.dataNotFound.message'),
      );
    }

    Object.assign(result, {
      is_active: false,
    });

    return this.responseService.success(
      await this.segmentationService.save(result),
      this.messageService.get('general.list.success'),
    );
  }
}
