import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Order } from '../shared/models';

@Injectable({
  providedIn: 'root'
})
export class OrdersService {
  baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getOrdersForUser(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.baseUrl}orders`);
  }
  
  getOrderDetails(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.baseUrl}orders/${id}`);
  }
}
