import { TierService } from '../service/tier.service';
import { Observable } from 'rxjs/Observable';

import { Tier } from './tier.model';

export class Event{
  public public: boolean;
  private 'start-time': Date;
  private 'end-time': Date;
  private 'gates-open': Date;
  private 'local-tickets-from': number;

  constructor(public endpoint: string, public title: string, public description: string, public category: string,
                startTime: string, endTime: string, gatesOpen: string, public place: string, isPublic: boolean,
                public cancelled: boolean, public featured: boolean, startPrice: number, public flyer: string,
                public banner: string, private _tierService: TierService){
    this['start-time'] = new Date(startTime);
    this['end-time'] = new Date(endTime);
    this['gates-open'] = new Date(gatesOpen);
    this.public = isPublic;
    this['local-tickets-from'] = startPrice;
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

  getTiers(): Observable<Array<Tier>>{
    return this._tierService.listForEvent(this);
  }
}
