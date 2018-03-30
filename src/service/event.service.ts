import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import "rxjs/add/operator/map";
import "rxjs/add/operator/switchMap";
import "rxjs/add/observable/of";

import { ConfigService } from './config.service';
import { ConnectionService } from './connection.service';

import { Connection } from '../model/connection.model';
import { Event } from '../model/event.model';

@Injectable()
export class EventService{
  private _connection: Connection;
  private _baseUrl: string;

  constructor(_configService: ConfigService, _connectionService: ConnectionService){
    this._connection = _connectionService.openConnection();
    this._baseUrl = _configService.baseUrl;
  }

  listUpcoming(page: number, records: number): Observable<Array<Event>>{
    return this._list(page,records,{upcoming:true,sort:"date",order:"asc"});
  }

  listForTitle(title: string, page: number, records: number): Observable<Array<Event>>{
    return this._list(page,records,{title: title});
  }

  private _list(page: number, records: number, parameters: any = {}){
    let queryParameters = {
      page: page,
      records: records
    }

    for(let parameter in parameters){
      queryParameters[parameter] = parameters[parameter];
    }

    return this._connection.get("/events",queryParameters)
      .map(response => response.entries)
      .switchMap(eventData => {
        let events = [];
        for(let i=0; i < eventData.length; i++){
          events.push(this._buildEvent(eventData[i]));
        }

        return Observable.of(events);
      })
  }

  private _buildEvent(eventData){
    let escapedBaseUrl = this._baseUrl.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
    return new Event(
      eventData["self"].match(new RegExp("^"+escapedBaseUrl+"(.*)$"))[1],
      eventData["title"],
      eventData["description"],
      eventData["category"],
      eventData["start-time"],
      eventData["end-time"],
      eventData["gates-open"],
      eventData["place"],
      eventData["public"],
      eventData["cancelled"],
      eventData["featured"],
      eventData["local-tickets-from"],
      eventData["flyer"],
      eventData["banner"]
    );
  }
}
