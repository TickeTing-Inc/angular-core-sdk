import { NgModule, ModuleWithProviders } from '@angular/core';
import { EventService } from './event.service';

export { EventService } from './event.service';

@NgModule({
})
export class TicketingModule {
  static forRoot(appConfig: any): ModuleWithProviders {
    return {
      ngModule: TicketingModule,
      providers: [
        {provide: 'APP_CONFIG', useValue: appConfig},
        EventService
      ]
    };
  }
}
