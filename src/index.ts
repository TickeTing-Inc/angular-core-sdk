//Import External Modules
import { NgModule, ModuleWithProviders } from '@angular/core';
import { HttpModule } from '@angular/http';

//Import Library Services
import { ConfigService } from './service/config.service';
import { CacheService } from './service/cache.service';
import { ConnectionService } from './service/connection.service';
import { EventService } from './service/event.service';
import { TierService } from './service/tier.service';
import { ProfileService } from './service/profile.service';
import { XpressCardService } from './service/xpress-card.service';
import { MerchantService } from './service/merchant.service';

//Export Library Services
export { ConfigService } from './service/config.service';
export { EventService } from './service/event.service';
export { ProfileService } from './service/profile.service';
export { MerchantService } from './service/merchant.service';

//Export Library Models
export { Event } from './model/event.model';
export { Tier } from './model/tier.model';
export { Profile } from './model/profile.model';
export { XpressCard } from './model/xpress-card.model';
export { Merchant } from './model/merchant.model';

@NgModule({
  imports:[
    HttpModule
  ],
  providers:[
    CacheService,
    ConnectionService,
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
        EventService,
        ProfileService,
        MerchantService
      ]
    };
  }
}
