import { Component, OnInit } from '@angular/core';
import sampleData from '../../REST-data.json';
import { FormControl, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  ats = {
    2: [],
    3: [],
    4: [],
    5: [],
    // 6: [],
  }
  combinedats = []

  combined: boolean = true;
  data = sampleData.slice(0, 5);
  filter: string;

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    let dLen = this.data.length;
    for (let i = 0; i < dLen; i++) {
      this.addPatient(this.data[i])
    }

    setTimeout(() => {
      this.addPatient(sampleData[21]);
    }, 10000);
    setTimeout(() => {
      this.addPatient(sampleData[22]);
    }, 15000);
    setTimeout(() => {
      this.addPatient(sampleData[36]);
    }, 17000);
    setTimeout(() => {
      this.addPatient(sampleData[37]);
    }, 23000);
    setTimeout(() => {
      this.addPatient(sampleData[45]);
    }, 30000);
    setTimeout(() => {
      this.addPatient(sampleData[48]);
    }, 35000);
    setTimeout(() => {
      this.addPatient(sampleData[115]);
    }, 38000);
  }

  addPatient(patient: any) {
    console.log(patient)
    this.combinedats.push(patient);
    this.combinedats = [...this.combinedats];
    this.ats[patient['ATS']].push(patient);
    this.ats[patient['ATS']] = [...this.ats[patient['ATS']]];
  }

  sendFilter(filterValue: string) {
    return this.filter = filterValue;
  }


}