import { Connection } from './connection.model';
import { Observable } from 'rxjs/Observable';

export class Tier{
  private 'local-price': number;
  private 'local-convenience': number;

  constructor(public endpoint: string, public title: string, public description: string, price: number,
                public quantity: number, public reserved: number, public sold: number, public remaining: number,
                public revenue: number, public availability: Date, public validity: Date, public exclusive: boolean,
                convenienceFee: number, private _connection: Connection){
    this['local-price'] = price;
    this['local-convenience'] = convenienceFee;
  }

  get price(): number{
    return this['local-price'];
  }

  get convenienceFee(): number{
    return this['local-convenience'];
  }

  hasOptions(): Observable<boolean>{
    return this._connection.get(this.endpoint+"/options")
      .switchMap(response => {
        return Observable.of(response.options.length > 0);
      })
  }
}
