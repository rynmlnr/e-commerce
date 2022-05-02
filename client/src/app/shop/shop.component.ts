import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Brand, Product, ProductType, ShopParams } from '../shared/models';
import { ShopService } from './shop.service';

@Component({
  selector: 'app-shop',
  templateUrl: './shop.component.html',
  styleUrls: ['./shop.component.css']
})
export class ShopComponent implements OnInit {
  @ViewChild('search') searchTerm!: ElementRef;
  products: Product[] = [];
  brands: Brand[] = [];
  productTypes: ProductType[] = [];
  shopParams: ShopParams;
  totalCount: number = 0;
  sortOptions = [
    {name: 'Alphabetical', value: 'name'},
    {name: 'Price: Low to High', value: 'priceAsc'},
    {name: 'Price: High to Low', value: 'priceDesc'},
  ];


  constructor(private shopService: ShopService) {
    this.shopParams = this.shopService.getShopParams();
  }

  ngOnInit(): void {
    this.getProducts(true);
    this.getBrands();
    this.getProductTypes();
  }

  getProducts(useCache = false): void {
    this.shopService.getProducts(useCache).subscribe(
      response => {
        this.products = response.data;
        this.totalCount = response.count;
      }, error => {
        console.log(error);
      }
    );
  }

  getBrands(): void {
    this.shopService.getBrands().subscribe(
      response => {
        this.brands = [{id: 0, name: 'All'}, ...response];
      }, error => {
        console.log(error);
      }
    );
  }

  getProductTypes(): void {
    this.shopService.getProductType().subscribe(
      response => {
        this.productTypes = [{id: 0, name: 'All'}, ...response];
      }, error => {
        console.log(error);
      }
    );
  }

  onBrandSelected(brandId: number): void {
    const params = this.shopService.getShopParams();
    params.selectedBrandId = brandId;
    params.pageNumber = 1;
    this.shopService.setShopParams(params);
    this.getProducts();
  }

  onTypeSelected(typeId: number): void {
    const params = this.shopService.getShopParams();
    params.selectedTypeId = typeId;
    params.pageNumber = 1;
    this.shopService.setShopParams(params);
    this.getProducts();
  }

  onSortSelected(sort: string): void {
    const params = this.shopService.getShopParams();
    params.selectedSort = sort;
    this.shopService.setShopParams(params);
    this.getProducts();
  }

  onPageChanged(event: any): void {
    if (this.shopParams.pageNumber !== event) {
      const params = this.shopService.getShopParams();
      params.pageNumber = event;
      this.shopService.setShopParams(params);
      this.getProducts(true);
    }
  }

  onSearch() {
    const params = this.shopService.getShopParams();
    params.search = this.searchTerm.nativeElement.value;
    params.pageNumber = 1;
    this.shopService.setShopParams(params);
    this.getProducts();
  }

  onReset() {
    this.searchTerm.nativeElement.value = '';
    this.shopParams = new ShopParams();
    this.shopService.setShopParams(this.shopParams);
    this.getProducts();
  }
}
