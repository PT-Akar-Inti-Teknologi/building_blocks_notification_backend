import { SelectQueryBuilder } from 'typeorm';
import { PaginationTransformer } from '../base/transformers/index.transformer';

export class QueryBuilderPaginationUtils<Entity> {
  async generatePagination(
    query: SelectQueryBuilder<Entity>,
    perPage: number,
    currentPage: number,
  ): Promise<PaginationTransformer<Entity>> {
    const [results, count]: [Entity[], number] = await query
      .skip((currentPage - 1) * perPage)
      .take(perPage)
      .getManyAndCount();

    return {
      current_page: currentPage,
      items: results,
      limit: perPage,
      total_item: count,
    };
  }
}
