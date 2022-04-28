import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Order } from 'src/app/shared/models';
import { BreadcrumbService } from 'xng-breadcrumb';
import { OrdersService } from '../orders.service';

@Component({
  selector: 'app-order-detailed',
  templateUrl: './order-detailed.component.html',
  styleUrls: ['./order-detailed.component.css']
})
export class OrderDetailedComponent implements OnInit {
  order?: Order;

  constructor(
    private ordersService: OrdersService,
    private route: ActivatedRoute,
    private bcService: BreadcrumbService) { }

  ngOnInit(): void {
    this.getOrderDetails();
  }

  getOrderDetails() {
    const orderId = +(this.route.snapshot.paramMap.get('id')!);
    this.ordersService.getOrderDetails(orderId).subscribe(
      (order) => {
        this.order = order;
        console.log(order);
        this.bcService.set('@OrderDetailed', `Order# ${order.id} - ${order.status}`);
      }, error => {
        console.log(error);
      }
    );
  }

}
