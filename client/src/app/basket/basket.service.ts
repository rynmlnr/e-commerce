import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Basket, BasketInit, BasketItem, BasketTotals, DeliverMethod, Product } from '../shared/models';

@Injectable({
  providedIn: 'root'
})
export class BasketService {
  baseUrl = environment.apiUrl;
  private basketSource = new BehaviorSubject<Basket|null>(null);
  basket$ = this.basketSource.asObservable();
  private basketTotalSource = new BehaviorSubject<BasketTotals|null>(null);
  basketTotal$ = this.basketTotalSource.asObservable();
  shipping = 0;

  constructor(private http: HttpClient) { }

  setShippingPrice(deliveryMethod: DeliverMethod) {
    this.shipping = deliveryMethod.price;
    const basket = this.getCurrentBasketValue();
    basket!.deliveryMethodId = deliveryMethod.id;
    basket!.shippingPrice = deliveryMethod.price;
    this.calculateTotals();
    this.setBasket(basket!);
  }

  getBasket(id: string) {
    return this.http.get(`${this.baseUrl}basket?id=${id}`)
      .pipe( 
        map((basket: Basket|any) => {
          this.basketSource.next(basket);
          this.shipping = basket.shippingPrice;
          this.calculateTotals();
        })
      );
  }

  setBasket(basket: Basket) {
    return this.http.post(`${this.baseUrl}basket`, basket).subscribe(
      (response: Basket|any) => {
        this.basketSource.next(response);
        this.calculateTotals();
      },
      error => {
        console.log(error);
      }
    );
  }

  getCurrentBasketValue() {
    return this.basketSource.value;
  }

  addItemToBasket(item: Product, quantity = 1) {
    const itemToAdd: BasketItem = this.mapProductItemToBasketItem(item, quantity);
    // Get basket or Create new basket/cart
    const basket = this.getCurrentBasketValue() ?? this.createBasket();
    // Add item in to the basket/cart
    basket.items = this.addOrUpdateItem(basket.items, itemToAdd, quantity);
    // Update basket/cart value
    this.setBasket(basket);
  }

  incrementItemQuantity(item: BasketItem) {
    const basket = this.getCurrentBasketValue();
    // Get item in basket
    const foundItemIndex = Number(basket?.items.findIndex(x => x.id === item.id));
    if (basket) {
      // Update item quantity in the basket
      basket.items[foundItemIndex].quantity++;
      this.setBasket(basket);
    }
  }

  decrementItemQuantity(item: BasketItem) {
    const basket = this.getCurrentBasketValue();
    // Get item in basket
    const foundItemIndex = Number(basket?.items.findIndex(x => x.id === item.id));
    if (basket) {
      if (basket.items[foundItemIndex].quantity > 1) {
        // Decrease item if > 1 & update quantity
        basket.items[foundItemIndex].quantity--;
        this.setBasket(basket);
      } else {
        // Remove item in the basket === 1
        this.removeItemFromBasket(item);
      }
    }
  }

  removeItemFromBasket(item: BasketItem) {
    const basket = this.getCurrentBasketValue();
    // Check if item is in the basket/cart
    if (basket?.items.some(x => x.id === item.id)) {
      // Get items exclude the item to be remove
      basket.items = basket.items.filter(i => i.id !== item.id);
      if (basket.items.length > 0) {
        // Remove item in the basket if items in basket > 0
        this.setBasket(basket);
      } else {
        // Delete basket if not items is in the cart/basket
        this.deleteBasket(basket);
      }
    }
  }

  deleteLocalBasket(id: string) {
    this.basketSource.next(null);
    this.basketTotalSource.next(null);
    localStorage.removeItem('basket_id');
  }

  deleteBasket(basket: Basket) {
    return this.http.delete(`${this.baseUrl}basket?id=${basket.id}`).subscribe(
      () => {
        this.basketSource.next(null);
        this.basketTotalSource.next(null);
        localStorage.removeItem('basket_id');
      }, error => {
        console.log(error);
      }
    )
  }

  createPaymentIntent() {
    return this.http.post(`${this.baseUrl}payments/${this.getCurrentBasketValue()?.id}`, {})
      .pipe(
        map((basket: Basket|any) => {
          this.basketSource.next(basket);
        })
      );
  }

  private addOrUpdateItem(items: BasketItem[], itemToAdd: BasketItem, quantity: number): BasketItem[] {
    // Get item in the basket/cart
    const index = items.findIndex(i => i.id === itemToAdd.id);
    // Item not in the basket
    if (index === -1) {
      // Set quantity and add item in the basket
      itemToAdd.quantity = quantity;
      items.push(itemToAdd);
    } else {
      // Update quantity in the cart
      items[index].quantity += quantity;
    }

    return items;
  }

  private createBasket(): Basket {
    const basket = new BasketInit();
    localStorage.setItem('basket_id', basket.id);

    return basket;
  }

  private mapProductItemToBasketItem(item: Product, quantity: number): BasketItem {
    return {
      id: item.id,
      productName: item.name,
      price: item.price,
      pictureUrl: item.pictureUrl,
      quantity,
      brand: item.productBrand,
      type: item.productBrand
    };
  }

  private calculateTotals() {
    const basket = this.getCurrentBasketValue();
    const shipping = this.shipping;
    const subtotal = basket?.items.reduce((s, i) => (i.price * i.quantity) + s, 0) ?? 0;
    const total = subtotal + shipping;
    this.basketTotalSource.next({shipping, total, subtotal});
  }
}
