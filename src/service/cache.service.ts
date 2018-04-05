import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Service } from './service';

@Injectable()
export class CacheService extends Service{
  private _cache: Map<string, {value: any, expiry: number}>;
  constructor(){
    super();
    this._cache = new Map<string, {value: any, expiry: number}>();
    let storedKeys = Object.keys(localStorage);
    for(let i=0; i < storedKeys.length; i++){
      let cacheKey = [];
      if(cacheKey = storedKeys[i].match(/^@ticketing\/angular\-core\-sdk:(.*)$/)){
        this._cache.set(cacheKey[1],JSON.parse(localStorage.getItem(storedKeys[i])));
      }
    }
  }

  retrieve(key:string, replacement: Function, builder: Function, ttl: number): Observable<any>{
    let self = this;
    return Observable.create(observer => {
      if(self.has(key)){
        let storedValue = self._retrieve(key);
        if(storedValue instanceof Array){
          let builtValues = [];
          for(let i=0; i < storedValue.length; i++){
            builtValues.push(builder(storedValue[i]));
          }
          observer.next(builtValues);
        }else{
          observer.next(builder(storedValue))
        }
      }else{
        observer.next([]);
      }

      if(!self.has(key) || self.isExpired(key)){
        replacement()
          .subscribe(newValue => {
            if(newValue instanceof Array){
              let values = [];
              for(let i=0; i < newValue.length; i++){
                values.push(builder(newValue[i]));
              }

              newValue = values;
            }else{
              newValue = builder(newValue);
            }

            self._store(key,newValue,ttl);
            observer.next(newValue);
          })
      }
    });
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

  isValid(key: string): boolean{
    return this.has(key) && !this.isExpired(key);
  }

  private _store(key: string,value: any,ttl: number){
    //Remove functions from being persisted
    let persistantValue;
    if(value instanceof Array){
      persistantValue = [];
      for(let i=0; i < value.length; i++){
        let nextValue = {};
        for(let field in value[i]){
          if(typeof(value[i][field]) !== "function" && !(value[i][field] instanceof Service)){
            nextValue[field] = value[i][field];
          }
        }
        persistantValue.push(nextValue);
      }
    }else{
      persistantValue = {};
      for(let field in value){
        if(typeof(value[field]) !== "function" && !(value[field] instanceof Service)){
          persistantValue[field] = value[field];
        }
      }
    }

    let cacheValue = {value: persistantValue, expiry: this._now() + ttl*1000};
    this._cache.set(key,cacheValue);
    localStorage.setItem("@ticketing/angular-core-sdk:"+key,JSON.stringify(cacheValue));
  }

  private _retrieve(key:string): any{
    return this.has(key)?this._cache.get(key).value:null;
  }

  private _now(){
    return Date.now();
  }
}
