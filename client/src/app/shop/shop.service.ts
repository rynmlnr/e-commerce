import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Brand, Pagination, PaginationData, Product, ProductType, ShopParams } from '../shared/models';

@Injectable({
  providedIn: 'root'
})
export class ShopService {
  baseUrl = environment.apiUrl;
  products: Product[] = [];
  brands: Brand[] = [];
  productTypes: ProductType[] = [];
  pagination = new PaginationData();
  shopParams = new ShopParams();
  productCache = new Map();

  constructor(private http: HttpClient) { }

  getProducts(useCache: boolean): Observable<Pagination> {
    if (useCache === false) {
      this.productCache = new Map();
    }

    if (this.productCache.size > 0 && useCache === true) {
      if (this.productCache.has(Object.values(this.shopParams).join('-'))) {
        this.pagination.data = this.productCache.get(Object.values(this.shopParams).join('-'));
        return of(this.pagination);
      }
    }


    let params = new HttpParams();
    const shopParams = this.shopParams;
    if (shopParams.selectedBrandId !== 0) {
      params = params.append('brandId', shopParams.selectedBrandId.toString());
    }
    if (shopParams.selectedTypeId !== 0) {
      params = params.append('typeId', shopParams.selectedTypeId.toString());
    }
    if (shopParams.search) {
      params = params.append('search', shopParams.search);
    }
    params = params.append('sort', shopParams.selectedSort);
    params = params.append('pageIndex', shopParams.pageNumber.toString());
    params = params.append('pageSize', shopParams.pageSize.toString());

    return this.http.get<Pagination>(`${this.baseUrl}products`, {params})
      .pipe(
        map((response: any) => {
          this.productCache.set(Object.values(this.shopParams).join('-'), response.data);
          this.pagination = response;
          return this.pagination;
        })
      );
  }

  setShopParams(params: ShopParams) {
    this.shopParams = params;
  }

  getShopParams() {
    return this.shopParams;
  }

  getProduct(id: number): Observable<Product> {
    let product!: Product;
    this.productCache.forEach((products: Product[]) => {
      product = products.find(p => p.id === id)!;
    });

    if (product) {
      return of(product);
    }
    return this.http.get<Product>(`${this.baseUrl}products/${id}`)
  }

  getBrands(): Observable<Brand[]> {
    if (this.brands.length > 0) {
      return of(this.brands);
    }
    return this.http.get<Brand[]>(`${this.baseUrl}products/brands`)
      .pipe(
        map(response => {
          this.brands = response;
          return response;
        })
      );
  }
  
  getProductType(): Observable<ProductType[]> {
    if (this.productTypes.length > 0) {
      return of(this.productTypes);
    }
    return this.http.get<ProductType[]>(`${this.baseUrl}products/types`)
      .pipe(
        map(response => {
          this.productTypes = response;
          return response;
        }
      )
    );
  }
}
