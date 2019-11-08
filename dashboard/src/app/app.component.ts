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
      this.addPatient(p, false)
    }

    setTimeout(() => {
      this.addPatient(sampleData[8], true);
    }, 10000);
    setTimeout(() => {
      this.addPatient(sampleData[9], true);
    }, 15000);
    setTimeout(() => {
      this.addPatient(sampleData[10], true);
    }, 17000);
    setTimeout(() => {
      this.addPatient(sampleData[11], true);
    }, 23000);
    setTimeout(() => {
      this.addPatient(sampleData[12], true);
    }, 30000);
    setTimeout(() => {
      this.addPatient(sampleData[13], true);
    }, 35000);
  }

  addPatient(patient: any, newPatient: boolean) {
    // console.log(patient)
    let now = new Date();
    let year = now.getFullYear();
    let month = ('00' + (now.getMonth() + 1)).slice(-2);
    let day = ('00' + now.getDate()).slice(-2);
    let min = ('00' + (now.getMinutes() - 1 % 60)).slice(-2);
    let hour = ('00' + now.getHours()).slice(-2);
    if (Number(min) > now.getMinutes()) {
      hour = String(Number(hour) - 1);
    }
    if (Number(hour) < 0) {
      hour = '23';
    }
    let sec = ('00' + ((now.getSeconds()) % 60)).slice(-2);
    let reg = year + '-' + month + '-' + day + ' ' + hour + ':' + min + ':' + sec;
    console.log(reg);
    if (!newPatient) {
      hour = ('00' + (now.getHours() - Math.floor(Math.random() * now.getHours() + 1))).slice(-2);
      if (Number(hour) < 0) {
        hour = String(24 + Number(hour));
        day = String(Number(day) - 1);
      }
      min = ('00' + (now.getMinutes() + Math.floor(Math.random() * 60)) % 60).slice(-2);
      sec = ('00' + now.getSeconds()).slice(-2);
      reg = year + '-' + month + '-' + day + ' ' + hour + ':' + min + ':' +  sec;
    }
    patient['Registration'] = reg;
    this.combinedats.push(patient);
    this.combinedats = [...this.combinedats];
  }

  updateFilter(val: string) {
    this.filterService.setFilter(val);
    return this.filter = val;
  }
}