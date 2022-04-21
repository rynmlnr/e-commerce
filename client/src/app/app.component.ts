import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Pagination, Product } from './models';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  title = 'E-Commerce App';
  products: Product[] = [];

  constructor(private http: HttpClient) {

  }

  ngOnInit(): void {
    this.http.get<Pagination>('https://localhost:7203/api/products?pageSize=50').subscribe(
      (response: Pagination) => {
        this.products = response.data;
      }, error => {
        console.log(error);
      }
    )
  }
}
