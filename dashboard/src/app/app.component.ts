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
    6: [],
  }
  combinedats = []

  combined: boolean = true;
  data = sampleData.slice(0, 5);
  filter: string;
  last;

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    let dLen = this.data.length;
    let temp = 2 * dLen;
    for (let i = 0; i < dLen; i++) {
      this.last = this.data[i];
      this.ats[this.data[i]['ATS']].push(this.data[i]);
      this.combinedats.push(this.data[i]);
    }

    setTimeout(() => {
      this.addPatient(this.last);
    }, 2000);
  }

  addPatient(patient: any) {
    this.combinedats.push(patient);
    this.combinedats = [...this.combinedats];
    this.ats[patient['ATS']].push(patient);
    this.ats[patient['ATS']] = [...this.ats[patient['ATS']]];
  }

  sendFilter(filterValue: string) {
    return this.filter = filterValue;
  }


}