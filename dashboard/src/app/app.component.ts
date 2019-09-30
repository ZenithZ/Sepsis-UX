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
  pushCombined;

  combined: boolean = true;
  data = sampleData.slice(20, 35);
  filter: string;
  last;

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    let dLen = this.data.length;
    let temp = 2 * dLen;
    for (let i = 0; i < dLen; i++) {
      let r = Math.floor((Math.random() * 6) + 1);
      this.data[i]['ATS'] = r == 1 ? 2 : r;
      this.data[i]['seen'] = false;
      this.data[i]['Name'] = this.data[i]['First Name'] + ' ' + this.data[i]['Last Name']
      if (!this.data[i]['LOC']) {
        this.data[i]['LOC'] = 15
      }
      this.ats[r == 1 ? 2 : r].push(this.data[i]);
      this.last = this.data[i];
      this.combinedats.push(this.data[i]);
    }

    setTimeout(() => {
      this.pushCombined = this.last;
    }, 2000);
  }

  sendFilter(filterValue: string) {
    return this.filter = filterValue;
  }


}