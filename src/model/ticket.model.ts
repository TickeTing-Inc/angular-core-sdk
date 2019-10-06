import { Observable } from 'rxjs';

import { TierService } from '../service/tier.service';
import { Tier } from './tier.model';

export class Ticket{
  public tier: Observable<Tier>;

  constructor(public endpoint: string, public serial: string, public status: string, private purchased: Date,
              private issued: Date, private redeemed: Date, public tierUri: string, private _tierService: TierService){
    this.purchased = new Date(purchased);
    this.issued = new Date(issued);
    this.redeemed = new Date(redeemed);
    this.tier = this._getTier();
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

  private _getTier(): Observable<Tier>{
    return this._tierService.getByUri(this.tierUri);
  }
}
