import { Component, OnInit } from '@angular/core';
import {FilterService} from './filter.service';
import sampleData from '../../REST-data.json';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  combinedats = []

  constructor (private filterService: FilterService) {};

  view: string = 'Combined';
  data = sampleData.slice(0, 7);
  filter: string;

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    let dLen = this.data.length;
    for (let i = 0; i < dLen; i++) {
      let p = this.data[i]
      this.addPatient(p)
    }

    setTimeout(() => {
      this.addPatient(sampleData[8]);
    }, 10000);
    setTimeout(() => {
      this.addPatient(sampleData[9]);
    }, 15000);
    setTimeout(() => {
      this.addPatient(sampleData[10]);
    }, 17000);
    setTimeout(() => {
      this.addPatient(sampleData[11]);
    }, 23000);
    setTimeout(() => {
      this.addPatient(sampleData[12]);
    }, 30000);
    setTimeout(() => {
      this.addPatient(sampleData[13]);
    }, 35000);
  }

  addPatient(patient: any) {
    // console.log(patient)
    this.combinedats.push(patient);
    this.combinedats = [...this.combinedats];
  }

  updateFilter(val: string) {
    this.filterService.setFilter(val);
    return this.filter = val;
  }


}