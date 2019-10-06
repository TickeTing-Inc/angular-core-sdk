//Import External Modules
import { NgModule, ModuleWithProviders } from '@angular/core';
import { HttpModule } from '@angular/http';

//Import Library Services
import { CacheService } from './service/cache.service';
import { ConfigService } from './service/config.service';
import { ConnectionService } from './service/connection.service';
import { EventService } from './service/event.service';
import { MerchantService } from './service/merchant.service';
import { OrderService } from './service/order.service';
import { ProfileService } from './service/profile.service';
import { TicketService } from './service/ticket.service';
import { TierService } from './service/tier.service';
import { XpressCardService } from './service/xpress-card.service';

//Export Library Services
export { CacheService } from './service/cache.service';
export { ConfigService } from './service/config.service';
export { ConnectionService } from './service/connection.service';
export { EventService } from './service/event.service';
export { MerchantService } from './service/merchant.service';
export { ModelService } from './service/model.service';
export { OrderService } from './service/order.service';
export { ProfileService } from './service/profile.service';
export { Service } from './service/service';
export { TicketService } from './service/ticket.service';
export { TierService } from './service/tier.service';
export { XpressCardService } from './service/xpress-card.service';

//Export Library Models
export { Connection } from './model/connection.model';
export { Event } from './model/event.model';
export { Merchant } from './model/merchant.model';
export { Order } from './model/order.model';
export { Profile } from './model/profile.model';
export { Ticket } from './model/ticket.model';
export { Tier } from './model/tier.model';
export { XpressCard } from './model/xpress-card.model';

@NgModule({
  imports:[
    HttpModule
  ],
  providers:[
    CacheService,
    ConfigService,
    ConnectionService,
    EventService,
    MerchantService,
    OrderService,
    ProfileService,
    TicketService,
    TierService,
    XpressCardService
  ]
})
export class TicketingModule {
  static forRoot(appConfig: any): ModuleWithProviders {
    return {
      ngModule: TicketingModule,
      providers: [
        {provide: 'APP_CONFIG', useValue: appConfig},
        ConfigService,
        ConnectionService,
        EventService,
        MerchantService,
        OrderService,
        ProfileService,
        TicketService,
        TierService,
        XpressCardService
      ]
    };
  }
}
