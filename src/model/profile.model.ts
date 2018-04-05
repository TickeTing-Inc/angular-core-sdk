import { EventService } from '../service/event.service';
import { XpressCardService } from '../service/xpress-card.service';
import { TicketService } from '../service/ticket.service';
import { OrderService } from '../service/order.service';

import { XpressCard } from './xpress-card.model';
import { Event } from './event.model';
import { Order } from './order.model';

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
                public email: string, public phone: string, public active: boolean,
                private _eventService: EventService, private _xpressCardService: XpressCardService,
                private _ticketService: TicketService, private _orderService: OrderService){
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
        let ticketsProcessed = 0;
        let groupedTickets = {};
        let entityMap = {};

        if(groupBy == "tier"){
          for(let i=0; i < tickets.length; i++){
            tickets[i].tier.subscribe(tier => {
              if(!(tier.endpoint in entityMap)){
                groupedTickets[tier.endpoint] = [];
                entityMap[tier.endpoint] = tier;
              }

              groupedTickets[tier.endpoint].push(tickets[i]);
              ticketsProcessed++;

              if(ticketsProcessed == tickets.length){
                let groups = [];
                for(let tier in groupedTickets){
                  groups.push({
                    tier:entityMap[tier],
                    tickets:groupedTickets[tier]
                  });
                }

                observer.next(groups);
              }
            })
          }
        }else if(groupBy == "event"){
          for(let i=0; i < tickets.length; i++){
            tickets[i].tier.subscribe(tier => {
              this._eventService.listForTier(tier).subscribe(events => {
                for(let j=0; j < events.length; j++){
                  let event = events[j];
                  if(!(event.endpoint in entityMap)){
                    groupedTickets[event.endpoint] = [];
                    entityMap[event.endpoint] = event;
                  }

                  groupedTickets[event.endpoint].push(tickets[i]);
                }

                ticketsProcessed++;
                if(ticketsProcessed == tickets.length){
                  let groups = [];
                  for(let event in groupedTickets){
                    groups.push({
                      event:entityMap[event],
                      tickets:groupedTickets[event]
                    });
                  }

                  observer.next(groups);
                }
              })
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

  placeOrder(device: string = "", os: string = "", version: string = ""): Observable<Order>{
    return this._orderService.createForProfile(this,device,os,version);
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
