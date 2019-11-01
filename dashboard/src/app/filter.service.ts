import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FilterService {

  filter = new BehaviorSubject<string>("");

  constructor() { }

  setFilter(str: string){
    this.filter.next(str);
  }
}
