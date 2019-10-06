import { Http, Headers, URLSearchParams, RequestOptions } from '@angular/http';

import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

export class Connection{
  private _baseUrl: string;
  private _key: string;
  private _secret: string;
  private _http: Http;

  constructor(baseUrl: Observable<string>, key: Observable<string>, secret: Observable<string>, httpClient: Http){
    baseUrl.subscribe(baseUrl => {
      this._baseUrl = baseUrl;
    })

    key.subscribe(key => {
      this._key = key;
    })

    secret.subscribe(secret => {
      this._secret = secret;
    })

    this._http = httpClient;
  }

  get(endpoint: string, queryParameters: any = {}){
    return this._request("get",endpoint,{},queryParameters)
      .pipe(map(response => response.json()));
  }

  post(endpoint: string, payload: any){
    return this._request("post",endpoint,{},{},payload)
      .pipe(map(response => response.json()));
  }

  put(endpoint: string, payload: any){
    return this._request("get",endpoint)
      .pipe(switchMap(response => {
        let headers = {
          "If-Match":response.headers.get('etag'),
          "If-Unmodified-Since":response.headers.get('last-modified')
        }

        return this._request("put",endpoint,headers,{},payload)
          .pipe(map(response => response.json()));
      }))
  }

  delete(endpoint: string){
    return this._request("get",endpoint)
      .pipe(switchMap(response => {
        let headers = {
          "If-Match":response.headers.get('etag'),
          "If-Unmodified-Since":response.headers.get('last-modified')
        }

        return this._request("delete",endpoint,headers)
          .pipe(map(response => response.json()));
      }))
  }

  private _request(method: string, endpoint: string, headers: any = {}, queryParameters: any = {}, payload: any = {}){
    let destination = this._baseUrl+endpoint;

    let requestHeaders = new Headers();
    requestHeaders.append("Authorization",'Basic '+btoa(`${this._key}:${this._secret}`));
    for(let header in headers){
      requestHeaders.append(header,headers[header]);
    }

    let requestParameters = new URLSearchParams();
    requestParameters.set("timestamp",((new Date()).getTime()).toString());
    for(let queryParameter in queryParameters){
      requestParameters.set(queryParameter,queryParameters[queryParameter]);
    }

    let options = new RequestOptions({
      url:destination,
      method:method,
      headers: requestHeaders,
      params: requestParameters,
      body:payload
    });

    return this._http.request(destination,options);
  }
}
