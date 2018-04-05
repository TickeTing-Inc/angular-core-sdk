/**
 * This is only for local test
 */
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { Component } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { TicketingModule, ProfileService, EventService } from '@ticketing/angular-core-sdk';

@Component({
  selector: 'app',
  templateUrl: "demo.html"
})
class AppComponent {
  public profile: any;
  public order: any;
  private tiers: any;

  constructor(_profileService: ProfileService, _eventService: EventService){
    _eventService.listUpcoming(1,1).subscribe(events => {
      events[0].tiers.subscribe(tiers => {
        this.tiers = tiers;
      })
    })

    _profileService.getByUsername("dondada").subscribe(profile => {
      this.profile = profile;
      profile.placeOrder().subscribe(order => {
        this.order = order;
      })
    })
  }

  addToOrder(){
     this.order.addItems(this.tiers[0],1).subscribe(success => console.log(success));
  }

  removeFromOrder(){
     this.order.removeItems(this.tiers[0],1).subscribe(success => console.log(success));
  }

  clearOrder(){
     this.order.clearItems().subscribe(success => console.log(success));
  }

  confirm(){
    this.order.confirm("Test confirmation",false).subscribe(success => console.log(success))
  }

  cancel(){
    this.order.cancel().subscribe(success => console.log(success))
  }

  cashSettle(){
    this.order.cashSettle(
      "TING0000",
      "abe70971875fc4db349b868dd39554ca",
      "015cfd099f7087ae3225c3e570cc57bc",
      "ee954e0e435e4dd06dc15565f4869ebf"
    ).subscribe(success => console.log(success));
  }

  cardSettle(){
    this.order.cardSettle(
      "Cardtest",
      "4111111111111111",
      "123",
      "01/19",
      "Langford's",
      "",
      "St. John's",
      "St. John's",
      "ag",
      "00000",
      "sven@kycsar.com",
      "12687720781"
    ).subscribe(success => console.log(success));
  }

  sendReceipt(){
    this.order.sendReceipt("sven@ticketingevents.co","Male").subscribe(success => console.log(success));
  }
}

@NgModule({
  bootstrap: [ AppComponent ],
  declarations: [ AppComponent ],
  imports: [ BrowserModule, TicketingModule.forRoot({
    key:"78f5296d00e244621b33a12a63878102",
    secret:"156a38ce00f6adb23485dcc8c57beeff",
    production:false,
    caching:true
  })]
})
class AppModule {}

platformBrowserDynamic().bootstrapModule(AppModule);
