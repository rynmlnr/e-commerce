export class ShopParams {
  selectedBrandId: number = 0;
  selectedTypeId: number = 0;
  selectedSort: string = 'name';
  pageNumber = 1;
  pageSize = 6;
  search!: string;
}