import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { CacheService } from './cache.service';
import { ConfigService } from './config.service';
import { ConnectionService } from './connection.service';
import { ModelService } from './model.service';
import { TierService } from './tier.service';

import { Profile } from '../model/profile.model';
import { Event } from '../model/event.model';
import { Ticket } from '../model/ticket.model';

@Injectable()
export class TicketService extends ModelService{
  constructor(_configService: ConfigService, _connectionService: ConnectionService,
                private _cacheService: CacheService, private _tierService: TierService){
      super(_configService,_connectionService);
  }

  listForProfile(profile: Profile, status: string = "", event: Event = null): Observable<Array<Ticket>>{
    let queryParameters = {};
    if(status){
      queryParameters['status'] = status;
    }

    if(event){
      queryParameters['event'] = this._baseUrl+event.endpoint;
    }

    let endpoint = profile.endpoint+"/wallet?";
    let cacheKey = endpoint+JSON.stringify(queryParameters);
    let self = this;
    return self._cacheService.retrieve(cacheKey,
      () => {
        return self._connection.get(endpoint,queryParameters)
          .map(wallet => wallet.tickets);
      },
      ticketData => {
        return self._buildTicket(ticketData,self);
      },60);
  }

  private _buildTicket(ticketData, self): Ticket{
    return Observable.create(observer => {
      observer.next(new Ticket(
        ("self" in ticketData)?self.getEndpoint(ticketData["self"]):ticketData["endpoint"],
        ticketData.serial,
        ticketData.status,
        ticketData.purchased,
        ticketData.issued,
        ticketData.redeemed,
        ("tierUri" in ticketData)?ticketData.tierUri:ticketData.tier,
        this._tierService
      ))
    });
  }
}
