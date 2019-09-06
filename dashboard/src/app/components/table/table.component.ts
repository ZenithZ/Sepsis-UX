import { Component, ViewChild, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { SelectionModel } from '@angular/cdk/collections';

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

  constructor(private snackBar: MatSnackBar) {}

  @Input() title: string;
  @Input() patients: any[];
  @Input() filter: string;

  currentTime: number;
  myInterval;
  displayedColumns: string[] = ['Seen', 'MRN', 'Name', 'DOB', 'LOC', 'Vitals', 'BG', 'Registration', 'Delta'];
  expandedElement: any | null;
  atsNo: number;
  dataSource: MatTableDataSource<any>;
  selection = new SelectionModel<any>(true, []);
  seen: any[] = [];

  @ViewChild(MatSort, { static: true }) sort: MatSort;

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
    console.log(this.dataSource)
  }

  ngOnInit() {
    this.atsNo = parseInt(this.title.split(" ")[1])
    this.dataSource = new MatTableDataSource(this.patients);
    this.dataSource.sort = this.sort;
    this.filter = "";
    this.getTime();
    this.myInterval = setInterval(() => {
      this.getTime()
    }, 1000)
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.filter.currentValue !== undefined) {
      this.applyFilter(changes.filter.currentValue)
    }
  }

  removeSelectedRows() {
    this.selection.selected.forEach(item => {
      let index = this.dataSource.data.indexOf(item);
      let patient = this.dataSource.data.splice(index, 1);
      this.seen.push(patient);

      let name = patient[0]['First Name'] + " " + patient[0]['Last Name'];
      this.openSnackBar("You've just removed a patient: " + name, 'Undo', 5000);
      
      this.dataSource = new MatTableDataSource<any>(this.dataSource.data);
    });
    this.selection = new SelectionModel<any>(true, []);
  }

  openSnackBar(message: string, action: string, duration: number) {
    let config = new MatSnackBarConfig();
    config.verticalPosition = 'bottom';
    config.duration = duration;

    let res = this.snackBar.open(message, action, config);

    res.onAction().subscribe(() => {
      if (action == 'Undo') {
        this.dataSource.data.push(this.seen.pop()[0]);
        this.dataSource = new MatTableDataSource<any>(this.dataSource.data);
      }
    });
  }

  getTime() {
    this.currentTime = Date.now();
  }

  getWaitTime(patient: any) {
    let seconds = Math.floor((this.currentTime - Date.parse(patient['Registration'])) / 1000);

    let days = Math.floor(seconds / (3600*24));
    seconds  -= days*3600*24;
    let hrs   = Math.floor(seconds / 3600);
    seconds  -= hrs*3600;
    let mnts = Math.floor(seconds / 60);
    seconds  -= mnts*60;

    return days+" Days "+hrs+":"+mnts+":"+seconds;
  }
}
