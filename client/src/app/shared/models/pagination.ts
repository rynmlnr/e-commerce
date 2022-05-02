import { Product } from "./product";

export interface Pagination {
  pageIndex: number;
  pageSize: number;
  count: number;
  data: Product[];
}

export class PaginationData implements Pagination {
  pageIndex = 0;
  pageSize = 0;
  count = 0;
  data = [];
}