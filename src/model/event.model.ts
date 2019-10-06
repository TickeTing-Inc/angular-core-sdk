import { TierService } from '../service/tier.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Connection } from './connection.model';
import { Tier } from './tier.model';
import { Profile } from './profile.model';

export class Event{
  public public: boolean;
  public tiers: Observable<Array<Tier>>;

  private 'start-time': Date;
  private 'end-time': Date;
  private 'gates-open': Date;
  private 'local-tickets-from': number;
  private 'tickets-from': number;

  constructor(public endpoint: string, public title: string, public description: string, public category: string,
                startTime: string, endTime: string, gatesOpen: string, public place: string, isPublic: boolean,
                public cancelled: boolean, public featured: boolean, startPrice: number, startPriceUSD: number,
                public flyer: string, public banner: string, private _tierService: TierService,
                private _connection: Connection){
    this['start-time'] = new Date(startTime);
    this['end-time'] = new Date(endTime);
    this['gates-open'] = new Date(gatesOpen);
    this.public = isPublic;
    this['local-tickets-from'] = startPrice;
    this['tickets-from'] = startPriceUSD;
    this.tiers = this._getTiers();
  }

  get startTime(): Date{
    return this['start-time'];
  }

  get endTime(): Date{
    return this['end-time'];
  }

  get gatesOpen(): Date{
    return this['gates-open'];
  }

  get venue(): string{
    return this.place;
  }

  get startPrice(): number{
    return this['local-tickets-from'];
  }

  get startPriceUSD(): number{
    return this['tickets-from'];
  }

  isOnGuestlist(profile: Profile): Observable<boolean>{
    return Observable.create(observer => {
      let isOnGuestlist = false;
      this._connection.get(this.endpoint+"/guestlist")
        .pipe(map(guestlist => guestlist.profiles))
        .subscribe(guestlist => {
          for(let i=0; i < guestlist.length; i++){
            let regex = new RegExp(profile.endpoint+"$");
            if(regex.test(guestlist[i])){
              isOnGuestlist = true;
              break;
            }
          }

          observer.next(isOnGuestlist);
      })
    });
  }

  private _getTiers(): Observable<Array<Tier>>{
    return this._tierService.listForEvent(this);
  }
}
