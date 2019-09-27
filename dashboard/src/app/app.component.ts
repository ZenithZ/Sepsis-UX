import { Component, OnInit } from '@angular/core';
import sampleData from '../../REST-data.json';
import { FormControl, Validators } from '@angular/forms';
import {Observable} from 'rxjs';
import {map, startWith, debounceTime, distinctUntilChanged} from 'rxjs/operators';
import {CdkDragDrop, moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';

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
  private debounce: number = 400;
  options: any[] = [];
  filteredOptions: Observable<string[]>;

  over;

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
    this.myControl.valueChanges.pipe(debounceTime(this.debounce), distinctUntilChanged())
    .subscribe(query => {
      this.sendFilter(query)
    });
  }

displayTable(table: string) {

  if (this.disabled == true) {
    for (let i=1; i<this.checkboxs.length; ++i) {
      this.checkboxs[i] = true;
    }
  }
  
  for (let i=1; i<this.checkboxs.length; ++i) {
    var temp = document.getElementById("d"+i)
    switch(table) {
      case 'c1':
        // this.checkboxs[1] = !this.checkboxs[1];
        break;
      case 'c2':
        this.checkboxs[2] = !this.checkboxs[2];
        break;
      case 'c3':
        // this.checkboxs[3] = !this.checkboxs[3];
        break;
      case 'c4':
        this.checkboxs[4] = !this.checkboxs[4];
        break;
      case 'c5':
        // this.checkboxs[5] = !this.checkboxs[5];
        break;
      case 'c6':
        this.checkboxs[6] = !this.checkboxs[6];
        break;
      default:
        break;
    }

    if (this.checkboxs[i] == true) temp.style.display = "block"; 
    else temp.style.display = "none"; 
  }
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

resetForm() {
  this.myControl.setValue('');
}

}