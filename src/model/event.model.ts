import { TierService } from '../service/tier.service';
import { Observable } from 'rxjs/Observable';

import { Tier } from './tier.model';

export class Event{
  public endpoint: string;
  public title: string;
  public description: string;
  public category: string;
  public startTime: Date;
  public endTime: Date;
  public gatesOpen: Date;
  public venue: string;
  public public: boolean;
  public cancelled: boolean;
  public featured: boolean;
  public startPrice: number;
  public flyer: string;
  public banner: string;

  private _tierService: TierService;

  constructor(endpoint: string, title: string, description: string, category: string, startTime: string, endTime: string,
              gatesOpen: string, venue: string, isPublic: boolean, isCancelled: boolean, isFeatured: boolean,
              startPrice: number, flyer: string, banner: string, tierService: TierService){
    this.endpoint = endpoint;
    this.title = title;
    this.description = description;
    this.category = category;
    this.startTime = new Date(startTime);
    this.endTime = new Date(endTime);
    this.gatesOpen = new Date(gatesOpen);
    this.venue = venue;
    this.public = isPublic;
    this.cancelled = isCancelled;
    this.featured = isFeatured;
    this.startPrice = startPrice;
    this.flyer = flyer;
    this.banner = banner;

    this._tierService = tierService;
  }

  getTiers(): Observable<Array<Tier>>{
    return this._tierService.listForEvent(this);
  }
}
