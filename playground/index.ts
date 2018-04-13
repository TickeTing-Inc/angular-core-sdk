/**
 * This is only for local test
 */
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { Component } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { TicketingModule, OrderService, ProfileService, EventService, Order, Tier, Profile } from '@ticketing/angular-core-sdk';

@Component({
  selector: 'app',
  templateUrl: "demo.html"
})
class AppComponent {
  public order: Order;
  private tier: Tier;
  private profile: Profile;

  constructor(_profileService: ProfileService, _eventService: EventService, private _orderService: OrderService){
    _eventService.listUpcoming(1,1).subscribe(events => {
      events[0].tiers.subscribe(tiers => {
        this.tier = tiers[0];
      })

      _profileService.getByUsername("svengineer").subscribe(profile => {
        this.profile = profile;
        profile.getActiveOrder().subscribe(order =>{
          this.order = order;
        })
      })
    })
  }

  createOrder(){
    this.profile.placeOrder().subscribe(order => {
      this.order = order;
    })
  }

  addToOrder(){
    this.order.addItems(this.tier,1).subscribe(success => {});
  }

  removeFromOrder(){
    this.order.removeItems(this.tier,1).subscribe(success => {});
  }

  clearOrder(){
    this.order.clearItems().subscribe(success => {});
  }

  confirm(){
    this.order.confirm().subscribe(success => {});
  }

  cancel(){
    this.order.cancel().subscribe(success => {});
  }

  cashSettle(){
    this.order.cashSettle(
      "TING0000",
      "abe70971875fc4db349b868dd39554ca",
      "015cfd099f7087ae3225c3e570cc57bc",
      "ee954e0e435e4dd06dc15565f4869ebf"
    ).subscribe(success => {});
  }

  cardSettle(){
    this.order.cardSettle(
      "Cardtest",
      "4111111111111111",
      "123",
      "12/19",
      "Langford's",
      "",
      "St. John's",
      "St. John's",
      "ag",
      "00000",
      "sveninem@gmail.com",
      "12687720781"
    ).subscribe(success => {});
  }

  sendReceipt(){
    this.order.sendReceipt("sven@ticketingevents.co").subscribe(success => {});
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
