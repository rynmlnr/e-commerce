import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Product } from 'src/app/shared/models';
import { BreadcrumbService } from 'xng-breadcrumb';
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
    private activatedRoute: ActivatedRoute,
    private bcService: BreadcrumbService) 
  {
    this.bcService.set('@productDetails', " ");
  }

  ngOnInit(): void {
    this.loadProduct();
  }

  loadProduct() {
    this.productId = Number(this.activatedRoute.snapshot.paramMap.get('id'));
    this.shopService.getProduct(this.productId).subscribe(
      product => {
        this.product = product;
        this.bcService.set('@productDetails', product.name);
      },
      error => {
        console.log(error);
      }
    );
  }

}
