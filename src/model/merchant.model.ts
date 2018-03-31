import { CacheService } from '../service/cache.service';
import { ConnectionService } from '../service/connection.service';
import { Connection } from './connection.model';

export class Merchant{
  private _connection: Connection;

  constructor(public endpoint: string, public name: string, public registered: Date,
                public active: boolean, private _cacheService: CacheService,
                _connectionService: ConnectionService){
    this._connection = _connectionService.openConnection();
  }

  getTokens(){
    let cacheKey = this.endpoint+"/token";
    let self = this;
    return this._cacheService.retrieve(cacheKey,
      () => {
        return self._connection.get(cacheKey);
      },
      tokenData => {
        return {
          code: tokenData.code,
          token: tokenData.token
        };
      },604800);
  }
}
