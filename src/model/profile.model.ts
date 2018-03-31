import { EventService } from '../service/event.service';
import { Event } from './event.model';

import { XpressCardService } from '../service/xpress-card.service';
import { XpressCard } from './xpress-card.model';

import { Observable } from 'rxjs/Observable';

export class Profile{
  private 'first-name': string;
  private 'last-name': string;

  constructor(public endpoint: string, private created: Date, public title: string, firstName: string,
                lastName: string, public username: string, private dob: Date, public country: string,
                public email: string, public phone: string, public active: boolean,
                private _eventService: EventService, private _xpressCardService: XpressCardService){
      this['first-name'] = firstName;
      this['last-name'] = lastName;
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

  getXpressCard(): Observable<XpressCard>{
    return this._xpressCardService.getByProfile(this);
  }

  listFavourites(): Observable<Array<Event>>{
    return this._eventService.listForProfileWishlist(this);
  }

  listAttending(): Observable<Array<Event>>{
    return this._eventService.listForProfileAttending(this);
  }

  listAttended(): Observable<Array<Event>>{
    return this._eventService.listForProfileAttended(this);
  }
}
