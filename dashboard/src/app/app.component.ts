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

  checkboxs: boolean[] = [true, true, true, true, true, true, true]
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
      this.data[i]['locValue'] = new FormControl('15', [Validators.required, Validators.min(3), Validators.max(15)]);
      this.ats[r].push(this.data[i]);
    }
    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value))
    );
    console.log("disabled: " + this.disabled)
  }

displayTable(table: string) {

  this.disabled = !this.disabled;

  console.log("disabled: " + this.disabled)
  console.log("Display table : " + table)

  if (this.disabled == true) {
    for (let i=1; i<this.checkboxs.length; ++i) {
      this.checkboxs[i] = true;
    }
    console.log("in disabled")
  } 
  else {
    for (let i=1; i<this.checkboxs.length; ++i) {
      this.checkboxs[i] = false;
    }
  }

  for (let i=1; i<this.checkboxs.length; ++i) {
    var temp = document.getElementById("d"+i)
    console.log("BEFORE switch checkbox" + i + ": " + this.checkboxs[i])
    switch(table) {
      case 'c1':
        this.checkboxs[1] = !this.checkboxs[1];
        break;
      case 'c2':
        this.checkboxs[2] = !this.checkboxs[2];
        break;
      case 'c3':
        this.checkboxs[3] = !this.checkboxs[3];
        break;
      case 'c4':
        this.checkboxs[4] = !this.checkboxs[4];
        break;
      case 'c5':
        this.checkboxs[5] = !this.checkboxs[5];
        break;
      case 'c6':
        this.checkboxs[6] = !this.checkboxs[6];
        break;
      case 'all':
        this.checkboxs[0] = !this.checkboxs[0];
        break;
      default:
        break;
    }
    console.log("AFTER  switch checkbox" + i + ": " + this.checkboxs[i])
    if (this.checkboxs[i] == true) temp.style.display = "block"; 
    else temp.style.display = "none"; 
  }
  console.log("--------------------------------------")
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