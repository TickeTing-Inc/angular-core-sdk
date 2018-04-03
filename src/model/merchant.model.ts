import { Observable } from 'rxjs/Observable';

import { CacheService } from '../service/cache.service';
import { ConnectionService } from '../service/connection.service';
import { OrderService } from '../service/order.service';
import { ProfileService } from '../service/profile.service';

import { Connection } from './connection.model';
import { Order } from './order.model';

export class Merchant{
  private _connection: Connection;

  constructor(public endpoint: string, public name: string, public registered: Date,
                public active: boolean, private _cacheService: CacheService,
                _connectionService: ConnectionService, private _orderService: OrderService,
                private _profileService: ProfileService){
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
}
