import { Component, OnInit, Input } from '@angular/core';
import sampleData from '../../REST-data.json';
import { FormControl, Validators } from '@angular/forms';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';

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
    6: [],
  }

  data = sampleData.slice(1, 50);
  filter: string;
  myControl = new FormControl();
  options: any[] = [];
  filteredOptions: Observable<string[]>;
  checkboxs: boolean[] = [true, false, false, false, false, false, false]
  disabled = true;

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    let dLen = this.data.length;
    let temp = 2 * dLen;
    for (let i = 0; i < dLen; i++) {
      let r = Math.floor((Math.random() * 6) + 1);
      this.data[i]['ATS'] = r;
      this.data[i]['seen'] = false;
      this.data[i]['Name'] = this.data[i]['First Name'] + ' ' + this.data[i]['Last Name']
      this.options[i] = this.data[i]['First Name'] + ' ' + this.data[i]['Last Name']
      this.options[temp] = this.data[i]['MRN']
      temp -= 1;
      // console.log(i + " " + this.data[i]['First Name'] + ' ' + this.data[i]['Last Name'])
      this.data[i]['locValue'] = new FormControl('15', [Validators.required, Validators.min(3), Validators.max(15)]);
      this.ats[r].push(this.data[i]);
    }
    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value))
    );
  }

displayTable(table: string) {

  var sec = document.getElementById("s1");
  console.log("c0 " + this.checkboxs[0])
  console.log("c1 " + this.checkboxs[1])
  console.log("disabled " + this.disabled)

  // if (this.disabled == true) {
  //   sec.style.display = "none";

  //   switch(table) {
  //     case 'c1': {
  //       var temp = document.getElementById("d1");
  //       if (this.checkboxs[1] == false) temp.style.display = "block"; 
  //       else temp.style.display = "none"; 
  //       break;
  //     }
  //     case 'c2': {
  //       var temp = document.getElementById("d2");
  //       if (this.checkboxs[2] == false) temp.style.display = "block"; 
  //       else temp.style.display = "none"; 
  //       break;
  //     }
  //     default: {
  //       sec.style.display = "none";
  //     }
  //   }
  // } 
  // else {
  //   sec.style.display = "block";
  //   for (let i=1; i<this.checkboxs.length; ++i) {
  //     this.checkboxs[i] = false;
  //   }
  // }
}

sendFilter(filterValue: string) {
  return this.filter = filterValue;
}

filterFirstName: string;
sendFilterFirst(filterValue: string) {
  return this.filterFirstName = filterValue;
}

private _filter(value: string): string[] {
  const filterValue = value.toLowerCase();

  return this.options.filter(option => option.toLowerCase().indexOf(filterValue) === 0);
}

}