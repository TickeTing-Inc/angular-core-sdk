import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ModelService } from './model.service';
import { ConfigService } from './config.service';
import { CacheService } from './cache.service';
import { ConnectionService } from './connection.service';

import { Profile } from '../model/profile.model';
import { Merchant } from '../model/merchant.model';
import { Order } from '../model/order.model';

@Injectable()
export class OrderService extends ModelService{
  private _lastOrder: string;

  constructor(_configService: ConfigService, _connectionService: ConnectionService,
                private _cacheService: CacheService){
    super(_configService,_connectionService);
    this._lastOrder = localStorage.getItem("last-order:@ticketing/angular-core-sdk");
  }

  listForProfile(profile: Profile, page: number, records: number,
                  statuses: Array<string> = []): Observable<Array<Order>>{
    return this._list(page,records,profile,null,"","",statuses);
  }

  listForMerchant(merchant: Merchant, page: number, records: number, startDate: string = "", endDate: string = "",
                    statuses: Array<string>, profile: Profile = null): Observable<Array<Order>>{
    return this._list(page,records,profile,merchant,startDate,endDate,statuses);
  }

  countForMerchant(merchant: Merchant, startDate: string = "", endDate: string = "", statuses: Array<string>,
                    profile: Profile = null): Observable<number>{
    return this._count(profile,merchant,startDate,endDate,statuses);
  }

  createForProfile(profile: Profile, device: string = "", os: string = "",
                    version: string = "", merchant: string = ""): Observable<Order>{
    let self = this;
    let payload = {
      'share-data':true,
      'device':device,
      'os':os,
      'version':version
    }

    if(merchant){
      payload['merchant'] = merchant;
    }

    return Observable.create(observer => {
      self._connection.post(profile.endpoint+"/orders",payload).subscribe(
        orderData => {
          let cacheKey = this.getEndpoint(orderData.self);
          self._cacheService.retrieve(cacheKey,
            () => {
              return Observable.create(observer => {
                observer.next(orderData);
              });
            },
            orderData => {
              return self._buildOrder(orderData,self);
            },60).subscribe(order => {
              if(order instanceof Order){
                observer.next(order);
              }
            })
        },
        error => {
          this.getActiveForProfile(profile).subscribe(
            order => {
              observer.next(order);
            })
        })
    })
  }

  public getActiveForProfile(profile: Profile){
    let self = this;
    return Observable.create(observer => {
      self._list(1,1,profile,null,"","",['opened','confirmed'],1).subscribe(order => {
        if(order.length > 0){
          observer.next(order[0]);
        }else{
          observer.next(null);
        }
      })
    });
  }

  private _list(page: number, records: number, profile: Profile = null, merchant: Merchant = null,
                  startDate: string = "", endDate: string = "", statuses: Array<string> = [],
                  ttl: number = 60): Observable<Array<Order>>{
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

    if(statuses){
      queryParameters['statuses'] = statuses.join(",");
    }

    let cacheKey = "/orders?"+JSON.stringify(queryParameters);
    let self = this;
    return this._cacheService.retrieve(cacheKey,
      () => {
        return Observable.create(observer => {
          self._connection.get("/orders",queryParameters)
            .pipe(map(response => response.entries))
            .subscribe(
              orderData => {
                observer.next(orderData);
              },
              error => {
                observer.next([]);
              }
            )
        })
      },
      orderData => {
        return self._buildOrder(orderData,self);
      },ttl);
  }

  private _count(profile: Profile = null, merchant: Merchant = null, startDate: string = "",
                  endDate: string = "", statuses: Array<string> = []): Observable<number>{
    let queryParameters = {
      page: 1,
      records: 1
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

    if(statuses){
      queryParameters['statuses'] = statuses.join(",");
    }

    return Observable.create(observer => {
      this._connection.get("/orders",queryParameters)
        .pipe(map(response => response.total))
        .subscribe(orderCount => {
          observer.next(orderCount);
        })
    })
  }

  private _buildOrder(orderData,self){
    return Observable.create(observer => {
      observer.next(new Order(
        ("self" in orderData)?self.getEndpoint(orderData["self"]):orderData["endpoint"],
        orderData.number,
        orderData.status,
        orderData.reason,
        orderData['local-total'],
        orderData['share-data'],
        orderData['xpress-card'],
        orderData.device,
        orderData.os,
        orderData.version,
        orderData.created,
        orderData.expires,
        orderData.closed,
        ("_merchant" in orderData)?orderData["_merchant"]:orderData["merchant"],
        ("_agent" in orderData)?orderData["_agent"]:orderData["agent"],
        self._ticketService,
        self._tierService,
        self._connectionService,
        self._cacheService,
        self._baseUrl,
        observer
      ))
    })
  }
}
