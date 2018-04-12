import { Observable } from 'rxjs/Observable';
import { Subscriber } from 'rxjs/Subscriber';
import { Profile} from './profile.model';
import { Tier } from './tier.model';
import { Connection } from './connection.model';

import { TicketService } from '../service/ticket.service';
import { TierService } from '../service/tier.service';
import { ConnectionService } from '../service/connection.service';
import { CacheService } from '../service/cache.service';

export class Order{
  public items: Observable<Array<{tier: Tier, amount: number}>>;
  private _connection: Connection;
  private _items: Array<{tier: Tier, amount: number}>;
  private "local-total": number;
  private "share-data": boolean;
  private _itemsObservers: Array<Subscriber<any>>;

  constructor(public endpoint: string, public number: string, private status: string, private reason: string,
              total: number, shareable: boolean, public device: string, public os: string,
              public version: string, public created: Date, public expires: Date, public closed: Date,
              private _merchant: any, private _agent: any, private _ticketService: TicketService,
              private _tierService: TierService,_connectionService: ConnectionService,
              private _cacheService: CacheService, private _baseUrl: string, private observer: Subscriber<any>){
    this.created = new Date(created);
    this.expires = new Date(expires);
    this.closed = new Date(closed);
    this['local-total'] = total;
    this['share-data'] = shareable;
    this.items = this._getItems();

    this._connection = _connectionService.openConnection();
    this._itemsObservers = [];
  }

  get total(){
    return this['local-total'];
  }

  get opened(){
    return this.created;
  }

  get merchant(): string{
    return this._merchant?this._merchant.name:"";
  }

  get agent(): string{
    return this._agent?this._agent.username:"";
  }

  isShareable(): boolean{
    return this['share-data'];
  }

  isOpen(): boolean{
    return this.status == "Opened";
  }

  isConfirmed(): boolean{
    return this.status == "Confirmed";
  }

  isFulfilled(): boolean{
    return this.status == "Fulfilled";
  }

  isActive(): boolean{
    return this.isOpen() || this.isConfirmed();
  }

  addItems(tier: Tier, amount: number): Observable<boolean>{
    if(!this.isOpen()){
      return Observable.of(false);
    }

    let self = this;
    return Observable.create(observer => {
      self._getItems(false).subscribe(items => {
        self._items = items;

        let newTier = true;
        for(let i=0; i < self._items.length; i++){
          if(self._items[i].tier.endpoint == tier.endpoint){
            newTier = false;
            self._items[i].amount += Math.min(amount,10-self._items[i].amount);
          }
        }

        if(newTier){
          self._items.push({
            tier: tier,
            amount: amount
          })
        }

        this._emitItems();
        observer.next(true);
      })
    })
  }

  removeItems(tier: Tier, amount: number): Observable<boolean>{
    if(!this.isOpen()){
      return Observable.of(false);
    }

    let self = this;
    return Observable.create(observer => {
      self._getItems(false).subscribe(items => {
        self._items = items;

        let oldTier = -1;
        for(let i=0; i < self._items.length; i++){
          if(self._items[i].tier.endpoint == tier.endpoint){
            self._items[i].amount -= amount;
          }

          if(self._items[i].amount <= 0){
            oldTier = i;
          }
        }

        if(oldTier >= 0){
          self._items.splice(oldTier,1);
        }

        self._emitItems();
        observer.next(true);
      })
    })
  }

  clearItems(){
    if(!this.isOpen()){
      return Observable.of(false);
    }

    let self = this;
    return Observable.create(observer => {
      self._getItems(false).subscribe(items => {
        self._items = items;
        self._items.splice(0,self._items.length);
        self._emitItems();
        observer.next(true);
      })
    })
  }

  confirm(reason: string = "User confirmed order.", shareable: boolean = true): Observable<boolean>{
    let self = this;
    return Observable.create(observer => {
      if(this.isOpen()){
        self._getItems(false).subscribe(items => {
          if(items.length > 0){
            let payload = {};
            for(let i=0; i < items.length; i++){
              payload[this._baseUrl+items[i].tier.endpoint] = items[i].amount;
            }

            self._connection.put(self.endpoint+"/items",{
              tickets: payload
            }).subscribe(
              items => {
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
                    this.observer.next(self);

                    observer.next(true);
                  },
                  error => {
                    observer.next(false);
                  })
              },
              error => {
                observer.next(false);
              })
          }else{
            observer.next(false);
          }
        })
      }else{
        observer.next(false);
      }
    });
  }

  cancel(reason: string = "User exited order confirmation"): Observable<boolean>{
    let self = this;
    return Observable.create(observer => {
      if(this.isActive()){
        self._connection.put(self.endpoint,{
          status:"Cancelled",
          reason:reason
        }).subscribe(
          order => {
            self.status = order.status;
            self.reason = order.reason;
            self['share-data'] = order['share-data'];
            self['local-total'] = order['local-total'];
            this.observer.next(self);

            observer.next(true);
          },
          error => {
            observer.next(false);
          })
      }else{
        observer.next(false);
      }
    });
  }

  cashSettle(merchantCode: string,merchantSecret: string,agentKey: string,agentSecret: string): Observable<boolean>{
    let self = this;
    return Observable.create(observer => {
      if(self.isConfirmed()){
        self._connection.post(self.endpoint+"/cash-payments",{
          'merchant-code':merchantCode,
          'merchant-secret':merchantSecret,
          'agent-key':agentKey,
          'agent-secret':agentSecret,
        }).subscribe(
          payment => {
            if(payment.result == "Success"){
              self.status = "Fulfilled";
              self.reason = "Order paid in full.";
              this.observer.next(self);

              observer.next(true);
            }else{
              observer.next(false);
            }
          },
          error => {
            observer.next(false);
          }
        )
      }else{
        observer.next(false);
      }
    })
  }

  cardSettle(cardholder: string, cardNumber: string, cardSecurity: string, cardExpiration: string,
              firstAddressLine: string, secondAddressLine: string, city: string, state: string, country: string,
              zip: string, email: string = "", phone: string = ""): Observable<boolean>{
    let self = this;
    return Observable.create(observer => {
      if(self.isConfirmed()){
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
        }).map(response => response.transactions)
        .subscribe(
          transactions => {
            if(transactions[0].result == "Success"){
              self.status = "Fulfilled";
              self.reason = "Order paid in full.";
              this.observer.next(self);

              observer.next(true);
            }else{
              observer.next(false);
            }
          },
          error => {
            observer.next(false);
          }
        )
      }else{
        observer.next(false);
      }
    })
  }

  sendReceipt(email: string, gender: string = ""): Observable<boolean>{
    return Observable.create(observer => {
      if(this.isFulfilled()){
        this._connection.post(this.endpoint+"/receipts",{
          email:email,
          gender:gender
        }).subscribe(
          receipt => {
            observer.next(true);
          },
          error => {
            observer.next(false);
          }
        )
      }else{
        observer.next(false);
      }
    })
  }

  private _getItems(register: boolean = true): Observable<Array<{tier: Tier, amount: number}>>{
    return Observable.create(observer => {
      if(this._items){
        observer.next(this._items);
      }else{
        this._loadItems().subscribe(items => {
          observer.next(items);
        })
      }

      if(register){
        this._itemsObservers.push(observer);
      }
    });
  }

  private _loadItems(): Observable<Array<{tier: Tier, amount: number}>>{
    let cacheKey = this.endpoint+"/items";
    let self = this;

    return Observable.create(observer => {
      self._cacheService.retrieve(cacheKey,
        () => {
          return Observable.create(internalObserver => {
            self._connection.get(cacheKey)
              .map(tickets => tickets.tickets)
              .subscribe(orderItems => {
                  let tiers = Object.keys(orderItems);
                  let tiersSeen = 0;
                  let details = [];

                  if(tiers.length){
                    for(let i=0; i < tiers.length; i++){
                      self._tierService.getByUri(tiers[i]).subscribe(tier => {
                        details.push({
                          tier:tier,
                          amount:orderItems[tiers[i]]
                        });

                        tiersSeen++;
                        if(tiersSeen == tiers.length){
                          self._items = details;
                          internalObserver.next(details);
                        }
                      })
                    }
                  }else{
                    self._items = details;
                    internalObserver.next(details);
                  }
              })
          })
        },
        orderItems => {
          return Observable.of(orderItems);
        },self.isActive()?60:604800).subscribe(items => {
          if(self._cacheService.isValid(cacheKey)){
            observer.next(items);
          }
        })
    })
  }

  private _emitItems(){
    for(let i=0; i < this._itemsObservers.length; i++){
      this._itemsObservers[i].next(this._items);
    }
  }
}
