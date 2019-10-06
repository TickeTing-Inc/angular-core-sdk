import { Observable } from 'rxjs';

import { CacheService } from '../service/cache.service';
import { ConnectionService } from '../service/connection.service';
import { OrderService } from '../service/order.service';
import { ProfileService } from '../service/profile.service';

import { Connection } from './connection.model';
import { Order } from './order.model';

export class Merchant{
  private _connection: Connection;
  public tokens: Observable<{code:string,token:string}>;

  constructor(public endpoint: string, public name: string, public registered: Date,
                public active: boolean, private _cacheService: CacheService,
                private _connectionService: ConnectionService, private _orderService: OrderService,
                private _profileService: ProfileService){
    this._connection = this._connectionService.openConnection();
    this.tokens = this._getTokens();
  }

  listSales(page: number, records: number, startDate: string = "", endDate: string = "",
              xpressCard: string = ""): Observable<Array<Order>>{
    let self = this;
    return Observable.create(caller => {
      Observable.create(observer => {
        if(xpressCard){
          self._profileService.getByXpressCard(xpressCard).subscribe(profile => {
            observer.next(profile);
          })
        }else{
          observer.next(null);
        }
      }).subscribe(profile => {
        self._orderService.listForMerchant(self,page,records,startDate,endDate,profile).subscribe(orders => {
          caller.next(orders);
        })
      })
    });
  }

  private _getTokens(): Observable<{code:string,token:string}>{
    let cacheKey = this.endpoint+"/token";
    let self = this;
    return this._cacheService.retrieve(cacheKey,
      () => {
        return self._connection.get(cacheKey);
      },
      tokenData => {
        return Observable.create(observer => {
          observer.next({
            code: tokenData.code,
            token: tokenData.token
          });
        })
      },604800);
  }
}
