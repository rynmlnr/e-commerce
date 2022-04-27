import { Component, OnInit } from '@angular/core';
import { AccountService } from './account/account.service';
import { BasketService } from './basket/basket.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  constructor(
    private basketService: BasketService,
    private accountService: AccountService) { }

  ngOnInit(): void {
    this.initializeBasket();
    this.loadUser();
  }

  initializeBasket(): void {
    const basketId = localStorage.getItem('basket_id');
    if (basketId) {
      this.basketService.getBasket(basketId).subscribe(() => {
        console.log('Initialized Basket')
      }, error => {
        console.log(error);
      });
    }
  }

  loadUser(): void {
    const token = localStorage.getItem('token');
    this.accountService.loadCurrentUser(token!)?.subscribe(() => {
      console.log('Load User')
    }, error => {
      console.log(error);
    });
  }


}
