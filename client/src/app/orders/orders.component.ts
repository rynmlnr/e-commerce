import { Component, OnInit } from '@angular/core';
import { Order } from '../shared/models';
import { OrdersService } from './orders.service';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
})
export class OrdersComponent implements OnInit {
  orders: Order[] = [];

  constructor(private ordersService: OrdersService) { }

  ngOnInit(): void {
    this.getUserOrders();
  }

  getUserOrders() {
    this.ordersService.getOrdersForUser().subscribe(
      (orders) => {
        this.orders = orders;
      }, error => {
        console.log(error);
      }
    );
  }
}
