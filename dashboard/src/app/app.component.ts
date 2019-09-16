import { Component, OnInit } from '@angular/core';
import sampleData from '../../REST-data.json';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  ats = {
    1: [],
    2: [],
    3: [],
    4: [],
    5: [],
  }

  data = sampleData.slice(1, 50);
  filter: string;

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    let dLen = this.data.length;
    for (let i = 0; i < dLen; i++) {
      let r = Math.floor((Math.random() * 6) + 1);
      this.data[i]['ATS'] = r;
      this.ats[r].push(this.data[i]);
      this.data[i]['seen'] = false;
    }
  }

  sendFilter(filterValue: string) {
    this.filter = filterValue;
  }
}