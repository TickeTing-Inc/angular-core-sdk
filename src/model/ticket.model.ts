import { Observable } from 'rxjs/Observable';

import { TierService } from '../service/tier.service';
import { Tier } from './tier.model';

export class Ticket{
  constructor(public endpoint: string, public serial: string, public status: string, private purchased: Date,
              private issued: Date, private redeemed: Date, private tier: string, private _tierService: TierService){
    this.purchased = new Date(purchased);
    this.issued = new Date(issued);
    this.redeemed = new Date(redeemed);
  }

  get acquistionDate(){
    return this.purchased;
  }

  get issueDate(){
    return this.issued;
  }

  get redemptionDate(){
    return this.redeemed;
  }

  getTier(): Observable<Tier>{
    return this._tierService.getByUri(this.tier);
  }
}
