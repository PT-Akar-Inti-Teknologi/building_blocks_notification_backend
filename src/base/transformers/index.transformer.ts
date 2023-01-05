export class PaginationTransformer<Entity> {
  total_item: number;

  limit: number;

  current_page: number;

  items: Entity[];
}
