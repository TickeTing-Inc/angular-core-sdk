import { EventService } from '../service/event.service';
import { XpressCardService } from '../service/xpress-card.service';
import { TicketService } from '../service/ticket.service';
import { TierService } from '../service/tier.service';
import { OrderService } from '../service/order.service';

import { XpressCard } from './xpress-card.model';
import { Event } from './event.model';
import { Order } from './order.model';
import { Tier } from './tier.model';

import { Observable } from 'rxjs/Observable';

export class Profile{
  public xpressCard: Observable<XpressCard>;
  public favourites: Observable<Array<Event>>;
  public attending: Observable<Array<Event>>;
  public attended: Observable<Array<Event>>;

  private 'first-name': string;
  private 'last-name': string;

  constructor(public endpoint: string, private created: Date, public title: string, firstName: string,
                lastName: string, public username: string, private dob: Date, public country: string,
                public email: string, public phone: string, public active: boolean, public guest: boolean,
                private _eventService: EventService, private _xpressCardService: XpressCardService,
                private _ticketService: TicketService, private _orderService: OrderService,
                private _tierService: TierService){
      this['first-name'] = firstName;
      this['last-name'] = lastName;

      this.xpressCard = this._getXpressCard();
      this.favourites = this._listFavourites();
      this.attending = this._listAttending();
      this.attended = this._listAttended();
  }

  get signupDate(): Date{
    return this.created;
  }

  get firstName(): string{
    return this['first-name'];
  }

  get lastName(): string{
    return this['last-name'];
  }

  get dateOfBirth(): Date{
    return this.dob;
  }

  get fullName(): string{
    return `${this.title} ${this.firstName} ${this.lastName}`;
  }

  listWallet(groupBy: string = "", status: string = "",
              event: Event = null): Observable<Array<any>>{
    let self = this;
    return Observable.create(observer => {
      this._ticketService.listForProfile(self,status,event).subscribe(tickets => {
        let groupedTickets = {};
        let entityMap = {};
        let tierTickets = {};

        for(let i=0; i < tickets.length; i++){
          if(!(tickets[i].tierUri in tierTickets)){
            tierTickets[tickets[i].tierUri] = [];
          }
          tierTickets[tickets[i].tierUri].push(tickets[i]);
        }

        if(tickets.length == 0){
          observer.next([]);
        }else if(groupBy == "tier"){
          let tiersProcessed = 0;
          for(let tierURI in tierTickets){
            self._tierService.getByUri(tierURI).subscribe((tier: Tier) => {
              if(!(tier.endpoint in entityMap)){
                groupedTickets[tier.endpoint] = [];
                entityMap[tier.endpoint] = tier;
              }

              for(let i=0; i < tierTickets[tierURI].length; i++){
                groupedTickets[tier.endpoint].push(tierTickets[tierURI][i]);
              }

              tiersProcessed++;

              if(tiersProcessed == Object.keys(tierTickets).length){
                let groups = [];
                for(let tier in groupedTickets){
                  let tierTickets = [];
                  for(let i=0; i < groupedTickets[tier].length; i++){
                    tierTickets.push(groupedTickets[tier][i]);
                  }

                  groups.push({
                    tier:entityMap[tier],
                    tickets:tierTickets
                  });
                }

                observer.next(groups);
              }
            })
          }
        }else if(groupBy == "event"){
          let tiersProcessed = 0;
          for(let tier in tierTickets){
            this._eventService.listForTier(tier).subscribe(events => {
              for(let i=0; i < events.length; i++){
                let event = events[i];
                if(!(event.endpoint in entityMap)){
                  groupedTickets[event.endpoint] = [];
                  entityMap[event.endpoint] = event;
                }

                for(let j=0; j < tierTickets[tier].length; j++){
                  groupedTickets[event.endpoint].push(tierTickets[tier][j]);
                }
              }

              tiersProcessed++;
              if(tiersProcessed == Object.keys(tierTickets).length){
                let groups = [];
                for(let event in groupedTickets){
                  let eventTickets = [];
                  for(let i=0; i < groupedTickets[event].length; i++){
                    eventTickets.push(groupedTickets[event][i]);
                  }

                  groups.push({
                    event:entityMap[event],
                    tickets:eventTickets
                  });
                }

                observer.next(groups);
              }
            })
          }
        }else{
          observer.next([{
            tickets:tickets
          }])
        }
      })
    })
  }

  listOrders(page: number = 1, records: number = 25): Observable<Array<Order>>{
    return this._orderService.listForProfile(this,page,records);
  }

  getActiveOrder(): Observable<Order>{
    return this._orderService.getActiveForProfile(this);
  }

  placeOrder(device: string = "", os: string = "", version: string = "",
              merchant: string = ""): Observable<Order>{
    return this._orderService.createForProfile(this,device,os,version,merchant);
  }

  private _getXpressCard(): Observable<XpressCard>{
    return this._xpressCardService.getByProfile(this);
  }

  private _listFavourites(): Observable<Array<Event>>{
    return this._eventService.listForProfileWishlist(this);
  }

  private _listAttending(): Observable<Array<Event>>{
    return this._eventService.listForProfileAttending(this);
  }

  private _listAttended(): Observable<Array<Event>>{
    return this._eventService.listForProfileAttended(this);
  }
}
