import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ModelService } from './model.service';
import { ConfigService } from './config.service';
import { ConnectionService } from './connection.service';
import { CacheService } from './cache.service';

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
        return Observable.create(observer => {
          observer.next(new XpressCard(
            ("self" in xpressCardData)?self.getEndpoint(xpressCardData["self"]):xpressCardData["endpoint"],
            xpressCardData["serial"],
            xpressCardData["activated"],
            xpressCardData["enabled"]
          ))
        });
      },3600);
  }
}
