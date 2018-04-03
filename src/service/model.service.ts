import { Injectable } from '@angular/core';
import { ConfigService } from './config.service';
import { ConnectionService } from './connection.service';
import { Connection } from '../model/connection.model';
import { Service } from './service';

@Injectable()
export class ModelService extends Service{
  protected _baseUrl: string;
  protected _connection: Connection;

  constructor(protected _configService: ConfigService, _connectionService: ConnectionService){
    super();
    this._baseUrl = _configService.baseUrl;
    this._connection = _connectionService.openConnection();
  }

  getEndpoint(uri: string){
    let escapedBaseUrl = this._baseUrl.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
    return uri.match(new RegExp("^"+escapedBaseUrl+"(.*)$"))[1];
  }
}
