import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

import { ConfigService } from './config.service';
import { Connection } from '../model/connection.model';

@Injectable()
export class ConnectionService{
  constructor(private _configService: ConfigService,private _httpClient: Http){}

  openConnection(): Connection{
    return new Connection(this._configService.baseUrl,this._configService.key,
                              this._configService.secret,this._httpClient);
  }
}
