/**
 * This is only for local test
 */
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { Component } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { TicketingModule, EventService } from '@ticketing/angular-core-sdk';

@Component({
  selector: 'app',
  templateUrl: "demo.html"
})
class AppComponent {
  public event: any;
  public tiers: any;
  public tierVisible: any;

  constructor(_eventService: EventService){
    _eventService.listUpcoming(1,1).subscribe(events => {
      this.tierVisible = {};
      this.event = events[0];
      this.tiers = [];
      if(this.event){
        this.event.getTiers().subscribe(tiers => {
          this.tiers = [];
          for(let i=0; i < tiers.length; i++){
            this.tiers.push(tiers[i]);
            this.tierVisible[tiers[i].endpoint] = this.tiers[i].hasOptions();
          }
        })
      }
    });
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
