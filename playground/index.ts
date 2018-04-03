/**
 * This is only for local test
 */
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { Component } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { TicketingModule, Profile, ProfileService, Order, OrderService, MerchantService } from '@ticketing/angular-core-sdk';

@Component({
  selector: 'app',
  templateUrl: "demo.html"
})
class AppComponent {
  public orders;

  constructor(_profileService: ProfileService, _orderService: OrderService, _merchantService: MerchantService){
    _merchantService.getByCode('TING0000').subscribe(merchant => {
      merchant.listSales(1,25).subscribe(orders => {
        this.orders = orders
        orders[0].listItems().subscribe(order => {
        })
      })
    })
  }
}

@NgModule({
  bootstrap: [ AppComponent ],
  declarations: [ AppComponent ],
  imports: [ BrowserModule, TicketingModule.forRoot({
    key:"015cfd099f7087ae3225c3e570cc57bc",
    secret:"ee954e0e435e4dd06dc15565f4869ebf",
    production:false,
    caching:true
  })]
})
class AppModule {}

platformBrowserDynamic().bootstrapModule(AppModule);
