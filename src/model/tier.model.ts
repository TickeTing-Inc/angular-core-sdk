import { Connection } from './connection.model';
import { Observable } from 'rxjs/Observable';

export class Tier{
  public endpoint: string;
  public title: string;
  public description: string;
  public price: number;
  public quantity: number;
  public reserved: number;
  public sold: number;
  public remaining: number;
  public revenue: number;
  public availability: Date;
  public validity: Date;
  public exclusive: boolean;
  public convenienceFee: number;

  private _connection: Connection;

  constructor(endpoint: string, title: string, description: string, price: number, quantity: number, reserved: number,
              sold: number, remaining: number, revenue: number, availability: Date, validity: Date,
              exclusive: boolean, convenienceFee: number, connection: Connection){
    this.endpoint = endpoint;
    this.title = title;
    this.description = description;
    this.price = price;
    this.quantity = quantity;
    this.reserved = reserved;
    this.sold = sold;
    this.remaining = remaining;
    this.revenue = revenue;
    this.availability = new Date(availability);
    this.validity = new Date(validity);
    this.exclusive = exclusive;
    this.convenienceFee = convenienceFee;
    this._connection = connection;
  }

  hasOptions(): Observable<boolean>{
    return this._connection.get(this.endpoint+"/options")
      .switchMap(response => {
        return Observable.of(response.options.length > 0);
      })
  }
}
