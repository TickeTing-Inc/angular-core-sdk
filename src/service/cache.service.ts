import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subscriber } from 'rxjs/Subscriber';
import { Service } from './service';
import { Connection } from '../model/connection.model';

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
          if(storedValue.length > 0){
            for(let i=0; i < storedValue.length; i++){
              builder(storedValue[i]).subscribe(storedValue => {
                builtValues[i] = storedValue;
                self._store(key,builtValues,(self._cache.get(key).expiry - this._now())/1000);
                observer.next(builtValues);
              })
            }
          }else{
            self._store(key,storedValue,(self._cache.get(key).expiry - this._now())/1000);
            observer.next(storedValue);
          }
        }else{
          builder(storedValue).subscribe(value => {
            self._store(key,value,(self._cache.get(key).expiry - this._now())/1000);
            observer.next(value);
          })
        }
      }else{
        observer.next([]);
      }

      if(!self.has(key) || self.isExpired(key) || self._retrieve(key) === null
          || (self._retrieve(key) instanceof Array && self._retrieve(key).length == 0)){
        replacement().subscribe(newValue => {
          if(newValue instanceof Array){
            let values = [];
            if(newValue.length > 0){
              for(let i=0; i < newValue.length; i++){
                builder(newValue[i]).subscribe(newValue => {
                  values[i] = newValue;
                  self._store(key,values,ttl);
                  observer.next(values);
                });
              }
            }else{
              self._store(key,newValue,ttl);
              observer.next(newValue);
            }
          }else{
            builder(newValue).subscribe(newValue => {
              self._store(key,newValue,ttl);
              observer.next(newValue);
            })
          }
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
          if(this._isStorable(value[i][field])){
            nextValue[field] = value[i][field];
          }
        }
        persistantValue.push(nextValue);
      }
    }else{
      persistantValue = {};
      for(let field in value){
        if(this._isStorable(value[field])){
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

  private _isStorable(value){
    let isStorable = true;
    if(value instanceof Array){
      for(let i=0; i<value.length; i++){
        isStorable = isStorable && this._isStorable(value[i]);
      }
    }else{
      isStorable = (
        typeof(value) !== "function"
          && !(value instanceof Service)
          && !(value instanceof Subscriber)
          && !(value instanceof Observable)
          && !(value instanceof Connection)
      );
    }

    return isStorable;
  }
}
