import { Observable } from 'rxjs/Observable';
import { Profile} from './profile.model';
import { Tier } from './tier.model';
import { Connection } from './connection.model';

import { TicketService } from '../service/ticket.service';
import { TierService } from '../service/tier.service';
import { ConnectionService } from '../service/connection.service';
import { CacheService } from '../service/cache.service';

export class Order{
  private _connection: Connection;
  private _items: Array<{tier: Tier, amount: number}>;
  private "local-total";
  private "share-data";

  constructor(public endpoint: string, public number: string, private status: string, private reason: string,
              total: number, shareable: boolean, public device: string, public os: string,
              public version: string, public created: Date, public expires: Date, public closed: Date,
              private merchant, private _ticketService: TicketService, private _tierService: TierService,
              _connectionService: ConnectionService, private _cacheService: CacheService){
    this.created = new Date(created);
    this.expires = new Date(expires);
    this.closed = new Date(closed);
    this['local-total'] = total;
    this['share-data'] = shareable;

    this._connection = _connectionService.openConnection();
  }

  get total(){
    return this['local-total'];
  }

  get opened(){
    return this.created;
  }

  isShareable(): boolean{
    return this['share-data'];
  }

  isOpen(): boolean{
    return this.status == "Opened" || this.status === "Confirmed";
  }

  getMerchant(): string{
    return this.merchant.name;
  }

  listItems(): Observable<Array<{tier: Tier, amount: number}>>{
    let cacheKey = this.endpoint+"/items";
    let self = this;
    return this._cacheService.retrieve(cacheKey,
      () => {
        return Observable.create(observer => {
          if(this._items){
            observer.next(this._items);
          }else{
            self._connection.get(cacheKey)
              .map(tickets => tickets.tickets)
              .subscribe(orderItems => {
                  let tiers = Object.keys(orderItems);
                  let tiersSeen = 0;
                  let details = [];

                  for(let i=0; i < tiers.length; i++){
                    self._tierService.getByUri(tiers[i]).subscribe(tier => {
                      details.push({
                        tier:tier,
                        amount:orderItems[tiers[i]]
                      });

                      tiersSeen++;
                      if(tiersSeen == tiers.length){
                        self._items = details;
                        observer.next(details);
                      }
                    })
                  }
                })
              }
        })
      },
      orderItems => {
        return orderItems;
      },this.isOpen()?60:604800);
  }

  addItems(tier: Tier, amount: number): Observable<Array<{tier: Tier, amount: number}>>{
    return Observable.create(observer => {
      this.listItems().subscribe(items => {
        this._items = items;

        let newTier = true;
        for(let i=0; i < this._items.length; i++){
          if(this._items[i].tier.endpoint == tier.endpoint){
            newTier = false;
            this._items[i].amount += amount;
          }
        }

        if(newTier){
          this._items.push({
            tier: tier,
            amount: amount
          })
        }

        observer.next(this._items);
      })
    })
  }

  removeItems(tier: Tier, amount: number): Observable<Array<{tier: Tier, amount: number}>>{
    return Observable.create(observer => {
      this.listItems().subscribe(items => {
        this._items = items;

        let oldTier = -1;
        for(let i=0; i < this._items.length; i++){
          if(this._items[i].tier.endpoint == tier.endpoint){
            this._items[i].amount -= amount;
          }

          if(this._items[i].amount <= 0){
            oldTier = i;
          }
        }

        if(oldTier >= 0){
          delete this._items[oldTier];
        }

        observer.next(this._items);
      })
    })
  }

  confirm(reason: string = "User confirmed order.", shareable: boolean = true): Observable<boolean>{
    let self = this;
    return Observable.create(observer => {
      self._connection.put(self.endpoint,{
        status:"Confirmed",
        reason:reason,
        'share-data':shareable
      }).subscribe(
        order => {
          self.status = order.status;
          self.reason = order.reason;
          self['share-data'] = order['share-data'];
          self['local-total'] = order['local-total'];

          observer.next(true);
        },
        error => {
          observer.next(false);
        })
    });
  }

  cashSettle(merchantCode: string,merchantSecret: string,agentKey: string,agentSecret: string): Observable<boolean>{
    let self = this;
    return Observable.create(observer => {
      self._connection.post(self.endpoint+"/cash-payments",{
        'merchant-code':merchantCode,
        'merchant-secret':merchantSecret,
        'agent-key':agentKey,
        'agent-secret':agentSecret,
      }).subscribe(
        payment => {
          observer.next(true);
        },
        error => {
          observer.next(false);
        }
      )
    })
  }

  cardSettle(cardholder: string, cardNumber: string, cardSecurity: string, cardExpiration: string,
              firstAddressLine: string, secondAddressLine: string, city: string, state: string, country: string,
              zip: string, email: string, phone: string): Observable<boolean>{
    let self = this;
    return Observable.create(observer => {
      self._connection.post(this.endpoint+"/transactions",{
        cardholder:cardholder,
        'card-number':cardNumber,
        'card-expiration':cardExpiration,
        'card-security':cardSecurity,
        country:country,
        address1:firstAddressLine,
        address2:secondAddressLine,
        city:city,
        state:state,
        zip:zip,
        email:email,
        phone:phone
      }).subscribe(
        transaction => {
          observer.next(true);
        },
        error => {
          observer.next(false);
        }
      )
    })
  }
}
