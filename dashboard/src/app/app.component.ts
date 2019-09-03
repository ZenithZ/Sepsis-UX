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
    5: []
  }

  data = sampleData.slice(1, 10);

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    var dLen = this.data.length;
    for (var i = 0; i < dLen; i++) {
      var r = Math.floor((Math.random() * 5) + 1);
      this.ats[r].push(this.data[i]);
      this.data[i]['ATS'] = r;
    }
    console.log(this.ats);
  }
}