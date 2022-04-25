import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Brand, Pagination, Product, ProductType, ShopParams } from '../shared/models';

@Injectable({
  providedIn: 'root'
})
export class ShopService {
  baseUrl = 'https://localhost:7203/api/';

  constructor(private http: HttpClient) { }

  getProducts(shopParams: ShopParams): Observable<Pagination> {
    let params = new HttpParams();
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

    return this.http.get<Pagination>(`${this.baseUrl}products`, {params});
  }

  getProduct(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.baseUrl}products/${id}`)
  }

  getBrands(): Observable<Brand[]> {
    return this.http.get<Brand[]>(`${this.baseUrl}products/brands`);
  }
  
  getProductType(): Observable<ProductType[]> {
    return this.http.get<ProductType[]>(`${this.baseUrl}products/types`);
  }
}
