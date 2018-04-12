import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import "rxjs/add/operator/map";
import "rxjs/add/observable/of";
import "rxjs/add/operator/switchMap";

import { ModelService } from './model.service';
import { ConfigService } from './config.service';
import { ConnectionService } from './connection.service';
import { CacheService } from './cache.service';
import { EventService } from './event.service';
import { TierService } from './tier.service';
import { TicketService } from './ticket.service';
import { XpressCardService } from './xpress-card.service';
import { OrderService } from './order.service';

import { Profile } from '../model/profile.model';
import { Order } from '../model/order.model';

@Injectable()
export class ProfileService extends ModelService{
  constructor(_configService: ConfigService, private _cacheService: CacheService, private _eventService: EventService,
                private _xpressCardService: XpressCardService, private _ticketService: TicketService,
                private _orderService: OrderService, _connectionService: ConnectionService){
    super(_configService, _connectionService);
  }

  getByUri(uri: string): Observable<Profile>{
    let cacheKey = this.getEndpoint(uri);
    let self = this;
    return this._cacheService.retrieve(cacheKey,
      () => {
        return self._connection.get(cacheKey)
      },
      profileData => {
        return this._buildProfile(profileData,self);
      },60);
  }

  getByUsername(username: string): Observable<Profile>{
    return this._get({username:username});
  }

  getByXpressCard(serial: string): Observable<Profile>{
    return this._get({xpress: serial});
  }

  getByOrder(order: Order): Observable<Profile>{
    let profileEndpoint = order.endpoint.match(/^(.*)\/orders\/[0-9]+$/)[1];
    return this._getByUri(this._baseUrl+profileEndpoint);
  }

  private _get(parameters: any = {}): Observable<Profile>{
    return this._list(1,1,parameters)
      .switchMap(profiles => {
        return Observable.of((profiles.length > 0)?profiles[0]:null)
      });
  }

  private _list(page: number, records: number, parameters: any = {}): Observable<Array<Profile>>{
    let queryParameters = {
      page: page,
      records: records
    }

    for(let parameter in parameters){
      queryParameters[parameter] = parameters[parameter];
    }

    let cacheKey = "/profiles?"+JSON.stringify(queryParameters);
    let self = this;
    return this._cacheService.retrieve(cacheKey,
      () => {
        return self._connection.get("/profiles",queryParameters)
          .map(response => response.entries)
      },
      profileData => {
        return this._buildProfile(profileData,self);
      },86400);
  }

  private _getByUri(uri: string): Observable<Profile>{
    let cacheKey = this.getEndpoint(uri);
    let self = this;
    return this._cacheService.retrieve(cacheKey,
      () => {
        return self._connection.get(cacheKey)
      },
      profileData => {
        return this._buildProfile(profileData,self);
      },60);
  }

  private _buildProfile(profileData,self){
    return Observable.create(observer => {
      observer.next(new Profile(
        ("self" in profileData)?self.getEndpoint(profileData["self"]):profileData["endpoint"],
        profileData["created"],
        profileData["title"],
        profileData["first-name"],
        profileData["last-name"],
        profileData["username"],
        profileData["dob"],
        profileData["country"],
        profileData["email"],
        profileData["phone"],
        profileData["active"],
        self._eventService,
        self._xpressCardService,
        self._ticketService,
        self._orderService
      ));
    })
  }
}
