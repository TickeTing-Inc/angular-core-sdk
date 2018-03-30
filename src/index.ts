//Import External Modules
import { NgModule, ModuleWithProviders } from '@angular/core';
import { HttpModule } from '@angular/http';

//Import Library Services
import { ConfigService } from './service/config.service';
import { CacheService } from './service/cache.service';
import { ConnectionService } from './service/connection.service';
import { EventService } from './service/event.service';
import { TierService } from './service/tier.service';

//Export Library Services
export { ConfigService } from './service/config.service';
export { EventService } from './service/event.service';

//Export Library Models
export { Event } from './model/event.model';
export { Tier } from './model/tier.model';

@NgModule({
  imports:[
    HttpModule
  ],
  providers:[
    CacheService,
    ConnectionService,
    TierService
  ]
})
export class TicketingModule {
  static forRoot(appConfig: any): ModuleWithProviders {
    return {
      ngModule: TicketingModule,
      providers: [
        {provide: 'APP_CONFIG', useValue: appConfig},
        ConfigService,
        EventService
      ]
    };
  }
}
