//Import External Modules
import { NgModule, ModuleWithProviders } from '@angular/core';
import { HttpModule } from '@angular/http';

//Import Library Services
import { ConfigService } from './service/config.service';
import { CacheService } from './service/cache.service';
import { ConnectionService } from './service/connection.service';
import { EventService } from './service/event.service';

//Export Library Services
export { ConfigService } from './service/config.service';
export { EventService } from './service/event.service';

//Export Library Models
import { Event } from './model/event.model';

@NgModule({
  imports:[
    HttpModule
  ],
  providers:[
    CacheService,
    ConnectionService
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
