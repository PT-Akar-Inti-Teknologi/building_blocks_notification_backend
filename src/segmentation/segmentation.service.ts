import { Injectable } from '@nestjs/common';
import { ServiceBase } from '../base/service/service.base';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryBuilderPaginationUtils } from '../utils/query-builder-pagination.utils';
import { PaginationTransformer } from '../base/transformers/index.transformer';
import { SegmentationsDocument } from './entities/segmentations.entity';
import { IndexSegmentationDTO } from './dto/index-segmentation.dto';

@Injectable()
export class SegmentationService extends ServiceBase<SegmentationsDocument> {
  private tableAlias = 'segmentations';

  constructor(
    @InjectRepository(SegmentationsDocument)
    public repository: Repository<SegmentationsDocument>,
  ) {
    super(repository);
  }

  async paginate(
    params: IndexSegmentationDTO,
  ): Promise<PaginationTransformer<SegmentationsDocument>> {
    const query: SelectQueryBuilder<SegmentationsDocument> =
      this.repository.createQueryBuilder(this.tableAlias);

    if (params.search) {
      query.where(`${this.tableAlias}.name ilike :search`, {
        search: `%${params.search}%`,
      });
    }

    return await new QueryBuilderPaginationUtils<SegmentationsDocument>().generatePagination(
      query,
      params.perPage,
      params.currentPage,
    );
  }
}
