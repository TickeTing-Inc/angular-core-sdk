import { Injectable } from '@angular/core';

@Injectable()
export class CacheService{
  private _cache: Map<string, {value: any, expiry: number}>;
  constructor(){
    this._cache = new Map<string, {value: any, expiry: number}>();
    let storedKeys = Object.keys(localStorage);
    for(let i=0; i < storedKeys.length; i++){
      let cacheKey = [];
      if(cacheKey = storedKeys[i].match(/^@ticketing\/angular\-core\-sdk:(.*)$/)){
        this._cache.set(cacheKey[1],JSON.parse(localStorage.getItem(storedKeys[i])));
      }
    }
  }

  store(key: string,value: any,ttl: number){
    let cacheValue = {value: value, expiry: this._now() + ttl*1000};

    this._cache.set(key,cacheValue)
    localStorage.setItem("@ticketing/angular-core-sdk:"+key,JSON.stringify(cacheValue));
  }

  retrieve(key:string): any{
    return this.has(key)?this._cache.get(key).value:null;
  }

  remove(key: string): boolean{
    return this._cache.delete(key);
  }

  has(key: string): boolean{
    return this._cache.has(key);
  }

  isExpired(key: string): boolean{
    return this.has(key)?this._now() > this._cache.get(key).expiry:false;
  }

  private _now(){
    return Date.now();
  }
}
