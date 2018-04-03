import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { ModelService } from './model.service';
import { ConfigService } from './config.service';
import { CacheService } from './cache.service';
import { ConnectionService } from './connection.service';
import { TicketService } from './ticket.service';
import { TierService } from './tier.service';

import { Profile } from '../model/profile.model';
import { Merchant } from '../model/merchant.model';
import { Order } from '../model/order.model';

@Injectable()
export class OrderService extends ModelService{
  constructor(_configService: ConfigService, private _connectionService: ConnectionService,
                private _cacheService: CacheService,private _ticketService: TicketService,
                private _tierService: TierService){
    super(_configService,_connectionService);
  }

  listForProfile(profile: Profile, page: number, records: number): Observable<Array<Order>>{
    return this._list(page,records,profile);
  }

  listForMerchant(merchant: Merchant, page: number, records: number, startDate: string = "",
                    endDate: string = "", profile: Profile = null): Observable<Array<Order>>{
    return this._list(page,records,profile,merchant,startDate,endDate);
  }

  createForProfile(profile: Profile, device: string = "", os: string = "",
                    version: string = ""): Observable<Order>{
    let self = this;
    return Observable.create(observer => {
      let cacheKey = profile.endpoint+"/orders";
      self._connection.post(cacheKey,{
        'share-data':true,
        'device':device,
        'os':os,
        'version':version
      }).subscribe(
        orderData => {
          self._cacheService.retrieve(cacheKey,
            () => {
              return Observable.of(orderData);
            },
            orderData => {
              return self._buildOrder(orderData,self);
            },60).subscribe(order => {
              observer.next(order);
            })
        },
        error => {
          self._connection.get(profile.endpoint+"/orders").subscribe(orderData => {
            let cacheKey = self.getEndpoint(orderData.active);
            self._cacheService.retrieve(cacheKey,
              () => {
                return self._connection.get(cacheKey);
              },
              orderData => {
                return self._buildOrder(orderData,self);
              },60).subscribe(order => {
                observer.next(order);
              })
            })
        })
    })
  }

  private _list(page: number, records: number, profile: Profile = null, merchant: Merchant = null,
                  startDate: string = "", endDate: string = ""): Observable<Array<Order>>{
    let queryParameters = {
      page: page,
      records: records,
      sort: 'date',
      order: 'desc'
    }

    if(profile){
      queryParameters['profile'] = profile.endpoint.match(/([0-9]{14}$)/)[1];
    }

    if(merchant){
      queryParameters['merchant'] = merchant.endpoint.match(/([0-9]{14}$)/)[1];
    }

    if(startDate){
      queryParameters['from'] = startDate;
    }

    if(endDate){
      queryParameters['to'] = endDate;
    }

    let cacheKey = "/orders?"+JSON.stringify(queryParameters);
    let self = this;
    return this._cacheService.retrieve(cacheKey,
      () => {
        return self._connection.get("/orders",queryParameters)
          .map(response => response.entries);
      },
      orderData => {
        return self._buildOrder(orderData,self);
      },60);
  }

  private _buildOrder(orderData,self){
    return new Order(
      ("self" in orderData)?self.getEndpoint(orderData["self"]):orderData["endpoint"],
      orderData.number,
      orderData.status,
      orderData.reason,
      orderData['local-total'],
      orderData['share-data'],
      orderData.device,
      orderData.os,
      orderData.version,
      orderData.created,
      orderData.expires,
      orderData.closed,
      orderData.merchant,
      self._ticketService,
      self._tierService,
      self._connectionService,
      self._cacheService
    );
  }
}
