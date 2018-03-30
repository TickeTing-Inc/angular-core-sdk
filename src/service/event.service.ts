import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import "rxjs/add/operator/map";
import "rxjs/add/observable/of";
import "rxjs/add/operator/switchMap";

import { Service } from './service';
import { ConfigService } from './config.service';
import { ConnectionService } from './connection.service';
import { CacheService } from './cache.service';
import { TierService } from './tier.service';

import { Connection } from '../model/connection.model';
import { Event } from '../model/event.model';

@Injectable()
export class EventService extends Service{
  private _connection: Connection;
  private _baseUrl: string;

  constructor(private _configService: ConfigService, private _connectionService: ConnectionService,
              private _cacheService: CacheService, private _tierService: TierService){
    super();
    this._connection = _connectionService.openConnection();
    this._baseUrl = _configService.baseUrl;
  }

  listUpcoming(page: number, records: number): Observable<Array<Event>>{
    return this._list(page,records,{upcoming:true,public:true,sort:"date",order:"asc"});
  }

  listForTitle(title: string, page: number, records: number): Observable<Array<Event>>{
    return this._list(page,records,{title: title});
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
        let escapedBaseUrl = self._baseUrl.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
        return new Event(
          ("self" in eventData)?eventData["self"].match(new RegExp("^"+escapedBaseUrl+"(.*)$"))[1]:eventData["endpoint"],
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
      },3600);
  }
}
