/**
 * This is only for local test
 */
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { Component } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { TicketingModule, EventService }  from '@ticketing/angular-core-sdk';

@Component({
  selector: 'app',
  templateUrl: "demo.html"
})
class AppComponent {
  public events: any;
  constructor(_eventService: EventService){
    this.events = _eventService.list();
  }
}

@NgModule({
  bootstrap: [ AppComponent ],
  declarations: [ AppComponent ],
  imports: [ BrowserModule, TicketingModule.forRoot({production:false}) ]
})
class AppModule {}

platformBrowserDynamic().bootstrapModule(AppModule);
