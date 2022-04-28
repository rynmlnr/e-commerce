import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { DeliverMethod, Order, OrderToCreate } from '../shared/models';

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {
  baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getDeliveryMethods(): Observable<DeliverMethod[]> {
    return this.http.get<DeliverMethod[]>(`${this.baseUrl}orders/deliveryMethods`).pipe(
      map((dm: DeliverMethod[]) => {
        return dm.sort((a, b) => b.price - a.price);
      })
    );
  }

  createOrder(order: OrderToCreate) {
    return this.http.post<Order>(`${this.baseUrl}orders`, order);
  }
}
