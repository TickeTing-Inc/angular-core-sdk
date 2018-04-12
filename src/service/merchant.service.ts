import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import "rxjs/add/operator/map";
import "rxjs/add/observable/of";
import "rxjs/add/operator/switchMap";

import { ModelService } from './model.service';
import { ConfigService } from './config.service';
import { ConnectionService } from './connection.service';
import { CacheService } from './cache.service';
import { OrderService } from './order.service';
import { ProfileService } from './profile.service';

import { Merchant } from '../model/merchant.model';

@Injectable()
export class MerchantService extends ModelService{
  constructor(_configService: ConfigService, private _connectionService: ConnectionService,
              private _cacheService: CacheService, private _orderService: OrderService,
              private _profileService: ProfileService){
    super(_configService,_connectionService);
  }

  getByUri(uri: string): Observable<Merchant>{
    let cacheKey = this.getEndpoint(uri);
    let self = this;
    return this._cacheService.retrieve(cacheKey,
      () => {
        return self._connection.get(cacheKey)
      },
      merchantData => {
        return this._buildMerchant(merchantData,self);
      },60);
  }

  getByCode(code: string): Observable<Merchant>{
    return this._get({code: code});
  }

  private _get(parameters: any = {}): Observable<Merchant>{
    return this._list(1,1,parameters)
      .switchMap(merchants => {
        return Observable.of((merchants.length > 0)?merchants[0]:null)
      });
  }

  private _list(page: number, records: number, parameters: any = {}): Observable<Array<Merchant>>{
    let queryParameters = {
      page: page,
      records: records
    }

    for(let parameter in parameters){
      queryParameters[parameter] = parameters[parameter];
    }

    let cacheKey = "/merchants?"+JSON.stringify(queryParameters);
    let self = this;
    return this._cacheService.retrieve(cacheKey,
      () => {
        return self._connection.get("/merchants",queryParameters)
          .map(response => response.entries)
      },
      merchantData => {
        return this._buildMerchant(merchantData,self);
      },604800);
  }

  private _buildMerchant(merchantData: any, self: any){
    return Observable.create(observer => {
      observer.next(new Merchant(
        ("self" in merchantData)?self.getEndpoint(merchantData["self"]):merchantData["endpoint"],
        merchantData["name"],
        merchantData["registered"],
        merchantData["active"],
        self._cacheService,
        self._connectionService,
        self._orderService,
        self._profileService
      ))
    })
  }
}
