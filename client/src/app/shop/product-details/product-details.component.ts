import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Product } from 'src/app/shared/models';
import { ShopService } from '../shop.service';

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.css']
})
export class ProductDetailsComponent implements OnInit {
  product!: Product;
  productId: number = 0

  constructor(
    private shopService: ShopService,
    private activatedRoute: ActivatedRoute) 
  {
    this.productId = Number(activatedRoute.snapshot.paramMap.get('id'));
  }

  ngOnInit(): void {
    this.loadProduct();
  }

  loadProduct() {
    this.shopService.getProduct(this.productId).subscribe(
      product => {
        this.product = product;
      },
      error => {
        console.log(error);
      }
    );
  }

}
