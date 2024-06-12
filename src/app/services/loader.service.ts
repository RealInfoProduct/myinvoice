import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {

  constructor() { }

  public loaderSetValue$ = new BehaviorSubject<any>(false);

  setLoader(value:any){    
    this.loaderSetValue$.next(value);
  }
}
