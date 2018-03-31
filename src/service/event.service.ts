import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import "rxjs/add/operator/map";
import "rxjs/add/observable/of";
import "rxjs/add/operator/switchMap";

import { ModelService } from './model.service';
import { ConfigService } from './config.service';
import { ConnectionService } from './connection.service';
import { CacheService } from './cache.service';
import { TierService } from './tier.service';

import { Event } from '../model/event.model';
import { Profile } from '../model/profile.model';

@Injectable()
export class EventService extends ModelService{
  constructor(_configService: ConfigService, _connectionService: ConnectionService,
              private _cacheService: CacheService, private _tierService: TierService){
    super(_configService,_connectionService);
  }

  listUpcoming(page: number, records: number): Observable<Array<Event>>{
    return this._list(page,records,{upcoming:true,public:true,sort:"date",order:"asc"});
  }

  listForTitle(title: string, page: number, records: number): Observable<Array<Event>>{
    return this._list(page,records,{title: title});
  }

  listForProfileWishlist(profile: Profile): Observable<Array<Event>>{
    return this._listForProfile(profile,"wishlist",3600);
  }

  listForProfileAttending(profile: Profile): Observable<Array<Event>>{
    return this._listForProfile(profile,"attending",3600);
  }

  listForProfileAttended(profile: Profile): Observable<Array<Event>>{
    return this._listForProfile(profile,"attended",86400);
  }

  private _list(page: number, records: number, parameters: any = {}): Observable<Array<Event>>{
    let queryParameters = {
      page: page,
      records: records
    }

    for(let parameter in parameters){
      queryParameters[parameter] = parameters[parameter];
    }

    let cacheKey = "/events?"+JSON.stringify(queryParameters);
    let self = this;
    return this._cacheService.retrieve(cacheKey,
      () => {
        return self._connection.get("/events",queryParameters)
          .map(response => response.entries)
      },
      eventData => {
        return self._buildEvent(eventData,self);
      },3600);
  }

  private _listForProfile(profile: Profile, type: string, ttl: number): Observable<Array<Event>>{
    let self = this;
    return this._cacheService.retrieve(profile.endpoint+"/"+type,
      () => {
        return self._connection.get(profile.endpoint+"/"+type)
          .map(response => response.events)
      },
      eventData => {
        return self._buildEvent(eventData,self);
      },ttl);
  }

  private _buildEvent(eventData: any, self: any){
      return new Event(
        ("self" in eventData)?self.getEndpoint(eventData["self"]):eventData["endpoint"],
        eventData["title"],
        eventData["description"],
        eventData["category"],
        ("start-time" in eventData)?eventData["start-time"]:eventData["startTime"],
        ("end-time" in eventData)?eventData["end-time"]:eventData["endTime"],
        ("gates-open" in eventData)?eventData["gates-open"]:eventData["gatesOpen"],
        ("place" in eventData)?eventData["place"]:eventData["venue"],
        eventData["public"],
        eventData["cancelled"],
        eventData["featured"],
        ("local-tickets-from" in eventData)?eventData["local-tickets-from"]:eventData["startPrice"],
        eventData["flyer"],
        eventData["banner"],
        self._tierService
      );
  }
}
