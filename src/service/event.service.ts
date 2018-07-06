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
import { Tier } from '../model/tier.model';
import { Profile } from '../model/profile.model';

@Injectable()
export class EventService extends ModelService{
  constructor(_configService: ConfigService, _connectionService: ConnectionService,
              private _cacheService: CacheService, private _tierService: TierService){
    super(_configService,_connectionService);
  }

  listUpcoming(page: number, records: number, title: string = "", order: string = "asc", sort: string = "date"): Observable<Array<Event>>{
    return this._list(page,records,{upcoming:true,cancelled:false,public:true,sort:sort,order:order,title:title});
  }

  listFeatured(page: number, records: number): Observable<Array<Event>>{
    return this._list(page,records,{featured:true,cancelled:false,public:true,sort:"date",order:"desc"});
  }

  listPromoted(page: number, records: number): Observable<Array<Event>>{
    return this._list(page,records,{promoted:true,cancelled:false,public:true,sort:"date",order:"desc"});
  }

  countUpcoming(title: string = ""): Observable<number>{
    return this._count({upcoming:true,public:true,sort:"date",order:"asc",title:title});
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

  listForTier(tier: Tier | string){
    let endpoint = "";
    if(typeof tier == "string"){
      endpoint = this.getEndpoint(tier)
    }else{
      endpoint = tier.endpoint;
    }
    return this._list(1,1,{},endpoint);
  }

  private _list(page: number, records: number, parameters: any = {}, prefix: string = ""): Observable<Array<Event>>{
    let queryParameters = {
      page: page,
      records: records
    }

    for(let parameter in parameters){
      if(parameters[parameter]){
        queryParameters[parameter] = parameters[parameter];
      }
    }

    let cacheKey = prefix+"/events?"+JSON.stringify(queryParameters);
    let self = this;
    return this._cacheService.retrieve(cacheKey,
      () => {
        return self._connection.get(prefix+"/events",queryParameters)
          .map(response => prefix?response.events:response.entries);
      },
      eventData => {
        return self._buildEvent(eventData,self);
      },1);
  }

  private _count(parameters: any = {}): Observable<number>{
    let queryParameters = {
      page: 1,
      records: 1
    }

    for(let parameter in parameters){
      queryParameters[parameter] = parameters[parameter];
    }

    return Observable.create(observer => {
      this._connection.get("/events",queryParameters)
        .map(response => response.total)
        .subscribe(count => {
          observer.next(count);
        })
      })
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
    return Observable.create(observer => {
      observer.next(new Event(
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
        ("tickets-from" in eventData)?eventData["tickets-from"]:eventData["startPriceUSD"],
        eventData["flyer"],
        eventData["banner"],
        self._tierService,
        self._connection
      ));
    })
  }
}
