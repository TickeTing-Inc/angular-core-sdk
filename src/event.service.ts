import { Inject, Injectable } from '@angular/core';

@Injectable()
export class EventService{
  constructor(@Inject('APP_CONFIG') private _appConfig: any){}

  list(): any{
    console.log(this._appConfig.production?"Is Production":"Is Sandbox");

    return [
      {
        name: "Tuesday on the Rocks",
        date: "27th December, 2018"
      },
      {
        name: "UP5 - Labour DAy All Inclusive",
        date: "May 6th, 2018"
      }
    ];
  }
}
