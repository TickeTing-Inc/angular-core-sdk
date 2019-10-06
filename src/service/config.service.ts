import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { config } from '../config';
import { Service } from './service';

@Injectable()
export class ConfigService extends Service{
  private _baseUrl: string;
  private _key: string;
  private _secret: string;
  private _isProduction: boolean;
  private _isCacheEnabled: boolean;

  private _baseUrlObservers: Array<any>;
  private _keyObservers: Array<any>;
  private _secretObservers: Array<any>;

  constructor(@Inject('APP_CONFIG') _appConfig: any){
    super();
    this._key = ("key" in _appConfig)?_appConfig.key:"";
    this._secret = ("secret" in _appConfig)?_appConfig.secret:"";
    this._isProduction = ("production" in _appConfig)?_appConfig.production:false;
    this._isCacheEnabled = ("caching" in _appConfig)?_appConfig.caching:true;
    this._baseUrl = this._isProduction?config.PRODUCTION_BASE:config.SANDBOX_BASE;

    this._baseUrlObservers = [];
    this._keyObservers = [];
    this._secretObservers = [];
  }

  get baseUrl(): Observable<string>{
    return Observable.create(observer => {
      this._baseUrlObservers.push(observer);
      observer.next(this._baseUrl);
    });
  }

  setBaseUrl(newBaseUrl: string){
    this._baseUrl = newBaseUrl;
    for(let i=0; i < this._baseUrlObservers.length; i++){
      this._baseUrlObservers[i].next(this._baseUrl);
    }
  }

  get key(): Observable<string>{
    return Observable.create(observer => {
      this._keyObservers.push(observer);
      observer.next(this._key);
    });
  }

  setKey(newKey: string){
    this._key = newKey;
    for(let i=0; i < this._keyObservers.length; i++){
      this._keyObservers[i].next(this._key);
    }
  }

  get secret(): Observable<string>{
    return Observable.create(observer => {
      this._secretObservers.push(observer);
      observer.next(this._secret);
    });
  }

  setSecret(newSecret: string){
    this._secret = newSecret;
    for(let i=0; i < this._secretObservers.length; i++){
      this._secretObservers[i].next(this._secret);
    }
  }

  isCacheEnabled(): boolean{
    return this._isCacheEnabled;
  }

  toggleCaching(){
    this._isCacheEnabled = !this._isCacheEnabled;
  }

  isProductionMode(): boolean{
    return this._isProduction;
  }

  toggleProduction(){
    this._isProduction = !this._isProduction;
  }
}
