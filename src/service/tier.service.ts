import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import "rxjs/add/operator/map";
import "rxjs/add/observable/of";
import "rxjs/add/operator/switchMap";

import { Service } from './service';
import { ConfigService } from './config.service';
import { ConnectionService } from './connection.service';
import { CacheService } from './cache.service';

import { Connection } from '../model/connection.model';
import { Event } from '../model/event.model';
import { Tier } from '../model/tier.model';

@Injectable()
export class TierService extends Service{
  private _connection: Connection;
  private _baseUrl: string;

  constructor(private _configService: ConfigService, private _connectionService: ConnectionService,
              private _cacheService: CacheService){
    super();
    this._connection = _connectionService.openConnection();
    this._baseUrl = _configService.baseUrl;
  }

  public listForEvent(event: Event): Observable<Array<Tier>>{
    let cacheKey = event.endpoint+"/tiers";
    let self = this;
    return this._cacheService.retrieve(cacheKey,
      () => {
        return self._connection.get(cacheKey)
          .map(response => response.tiers)
      },
      tierData => {
        let escapedBaseUrl = self._baseUrl.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
        return new Tier(
          ("self" in tierData)?tierData["self"].match(new RegExp("^"+escapedBaseUrl+"(.*)$"))[1]:tierData["endpoint"],
          tierData["title"],
          tierData["description"],
          ("local-price" in tierData)?tierData["local-price"]:tierData["price"],
          tierData["quantity"],
          tierData["reserved"],
          tierData["sold"],
          tierData["remaining"],
          tierData["revenue"],
          tierData["availability"],
          tierData["validity"],
          tierData["exclusive"],
          ("local-convenience" in tierData)?tierData["local-convenience"]:tierData["convenienceFee"],
          self._connection
        );
      },60);
  }
}
