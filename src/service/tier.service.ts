import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import "rxjs/add/operator/map";
import "rxjs/add/observable/of";
import "rxjs/add/operator/switchMap";

import { ModelService } from './model.service';
import { ConfigService } from './config.service';
import { ConnectionService } from './connection.service';
import { CacheService } from './cache.service';

import { Event } from '../model/event.model';
import { Tier } from '../model/tier.model';

@Injectable()
export class TierService extends ModelService{
  constructor(_configService: ConfigService, _connectionService: ConnectionService,
              private _cacheService: CacheService){
    super(_configService,_connectionService);
  }

  public getByUri(uri: string): Observable<Tier>{
    let cacheKey = this.getEndpoint(uri);
    let self = this;
    return this._cacheService.retrieve(cacheKey,
      () => {
        return self._connection.get(cacheKey)
      },
      tierData => {
        return this._buildTier(tierData,self);
      },60);
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
        return this._buildTier(tierData,self);
      },60);
  }

  private _buildTier(tierData,self){
    return new Tier(
      ("self" in tierData)?self.getEndpoint(tierData["self"]):tierData["endpoint"],
      tierData["title"],
      tierData["description"],
      tierData["local-price"],
      tierData["quantity"],
      tierData["reserved"],
      tierData["sold"],
      tierData["remaining"],
      tierData["revenue"],
      tierData["availability"],
      tierData["validity"],
      tierData["exclusive"],
      tierData["local-convenience"],
      self._connection
    );
  }
}
