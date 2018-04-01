import { Inject, Injectable } from '@angular/core';
import { config } from '../config';
import { Service } from './service';

@Injectable()
export class ConfigService extends Service{
  private _baseUrl: string;
  private _key: string;
  private _secret: string;
  private _isProduction: boolean;
  private _isCacheEnabled: boolean;

  constructor(@Inject('APP_CONFIG') _appConfig: any){
    super();
    this._key = ("key" in _appConfig)?_appConfig.key:"";
    this._secret = ("secret" in _appConfig)?_appConfig.secret:"";
    this._isProduction = ("production" in _appConfig)?_appConfig.production:false;
    this._isCacheEnabled = ("caching" in _appConfig)?_appConfig.caching:true;
    this._baseUrl = this._isProduction?config.PRODUCTION_BASE:config.SANDBOX_BASE;
  }

  get baseUrl():string{
    return this._baseUrl;
  }

  set baseUrl(newBaseUrl: string){
    this._baseUrl = newBaseUrl;
  }

  get key():string{
    return this._key;
  }

  set key(newKey: string){
    this._key = newKey;
  }

  get secret():string{
    return this._secret;
  }

  set secret(newSecret: string){
    this._secret = newSecret;
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
