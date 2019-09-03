import { Component, ViewChild, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0', visibility: 'hidden' })),
      state('expanded', style({ height: '*', visibility: 'visible' })),
      transition('expanded <=> collapsed', animate('250ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class TableComponent implements OnChanges {

  @Input() title: string;
  @Input() patients: any[];
  @Input() filter: string;

  currentTime: Date;
  // currentTime: number;
  myInterval;
  displayedColumns: string[] = ['Seen', 'MRN', 'Name', 'DOB', 'LOC', 'Vitals', 'BG', 'Registration', 'Delta'];
  expandedElement: any | null;
  atsNo: number;
  dataSource: MatTableDataSource<any>;
  // private _snackBar: MatSnackBar;
  deltaTime: number;
  deltaTimeString: string;
  // limit: number;

  @ViewChild(MatSort, { static: true }) sort: MatSort;

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
    console.log(this.dataSource)
  }

  ngOnInit() {
    this.atsNo = parseInt(this.title.split(" ")[1])
    this.dataSource = new MatTableDataSource(this.patients);
    this.dataSource.sort = this.sort;
    this.filter = ""
    this.getTime()
    this.myInterval = setInterval(() => {
      this.getTime()
      // if (this.deltaTime > this.limit) {
      //   this.openSnackBar(this.patients['Name'])
      // }
    }, 1000)
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.filter.currentValue !== undefined) {
      this.applyFilter(changes.filter.currentValue)
    }
  }

  getTime() {
    // this.currentTime = Date.now();
    this.currentTime = new Date();
    let total = Math.abs(this.currentTime.getTime() - this.patients['Registration'].getTime());
    let hr = Math.ceil((total % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)) - 1;
    var min = Math.ceil((total % (1000 * 60 * 60)) / (1000 * 60)) - 1;
    let sec = Math.ceil(total % (1000 * 60) / 1000) - 1;
    this.deltaTimeString = hr+"h: "+min+"min: "+sec+"s";
  }

  // openSnackBar(name: string) {
  //   this._snackBar.open(name + ' has been waiting for ' + this.limit, 'Ok', {
  //     duration: 99999,
  //   });
  // }

}
