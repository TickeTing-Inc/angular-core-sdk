import { Observable} from 'rxjs/Observable';

export class XpressCard{
  constructor(public endpoint: string, public serial: string, public activated: boolean, public enabled: boolean){}
}
