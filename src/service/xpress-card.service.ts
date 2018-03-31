import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import "rxjs/add/operator/map";
import "rxjs/add/observable/of";
import "rxjs/add/operator/switchMap";

import { ModelService } from './model.service';
import { ConfigService } from './config.service';
import { ConnectionService } from './connection.service';
import { CacheService } from './cache.service';

import { Connection } from '../model/connection.model';
import { Profile } from '../model/profile.model';
import { XpressCard } from '../model/xpress-card.model';

@Injectable()
export class XpressCardService extends ModelService{
  constructor(private _cacheService: CacheService, _configService: ConfigService,
                _connectionService: ConnectionService){
    super(_configService,_connectionService);
  }

  getByProfile(profile: Profile): Observable<XpressCard>{
    let self = this;
    return this._cacheService.retrieve(profile.endpoint+"/xpress",
      () => {
        return self._connection.get(profile.endpoint+"/xpress")
      },
      xpressCardData => {
        return new XpressCard(
          ("self" in xpressCardData)?self.getEndpoint(xpressCardData["self"]):xpressCardData["endpoint"],
          xpressCardData["serial"],
          xpressCardData["activated"],
          xpressCardData["enabled"]
        );
      },3600);
  }
}
