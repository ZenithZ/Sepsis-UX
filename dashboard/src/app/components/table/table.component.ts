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

  constructor(private snackBar: MatSnackBar) { }

  @Input() title: string;
  @Input() patients: any[];
  @Input() filter: string;

  currentTime: Date;
  myInterval;
  deltaTimeString: string;

  static readonly WAIT_THRESHOLD = {
    OVERTIME: 1800*10000,
    FINISH_SOON: 1500*10000,
    DURING: 1200*10000,
    BEGIN: 60*10000
  };

  displayedColumns: string[] = ['Seen', 'MRN', 'Name', 'DOB', 'LOC', 'Vitals', 'BG', 'Registration', 'Delta'];
  expandedElement: any | null;
  atsNo: number;
  dataSource: MatTableDataSource<any>;
  selection = new SelectionModel<any>(true, []);

  @ViewChild(MatSort, { static: true }) sort: MatSort;

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim().toLowerCase();
    
    this.dataSource.filter = filterValue.trim().toLowerCase();
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

  undoSeen(patient: any) {
    let config = new MatSnackBarConfig();
    config.verticalPosition = 'bottom';
    config.duration = 5000;

    let res = this.snackBar.open((patient['seen'] ? 'Seen' : 'Unseen') + " " + patient['First Name'] + " " + patient['Last Name'], 'Undo', config);

    res.onAction().subscribe(() => {
        patient['seen'] = !patient['seen'];
    });
  }

  getTime() {
    this.currentTime = new Date();
  }

  getWaitTime(patient: any) {
    return Math.floor((this.currentTime.getTime() - Date.parse(patient['Registration'])) / 1000);
  }

  formatWaitTime(patient: any) {
    let seconds = this.getWaitTime(patient);

    let days = Math.floor(seconds / (3600 * 24));
    seconds -= days * 3600 * 24;
    let hrs = Math.floor(seconds / 3600);
    seconds -= hrs * 3600;
    let mnts = Math.floor(seconds / 60);
    seconds -= mnts * 60;

    let ret = ""
    if (days !== 0) {
      ret += days + "d "
    }
    if (hrs <= 9) {
      ret += "0"
    }
    ret += hrs + ":"
    if (mnts <= 9) {
      ret += "0"
    }
    ret += mnts
    return ret
  }

  getWaitColor(patient: any) {
    let seconds = this.getWaitTime(patient);
    let col = '#000000';

    if (seconds < TableComponent.WAIT_THRESHOLD.BEGIN) {
      col = '#4caf50';
    } else if (seconds < TableComponent.WAIT_THRESHOLD.DURING) {
      col = '#ffeb3b';
    } else if (seconds < TableComponent.WAIT_THRESHOLD.FINISH_SOON) {
      col = '#ff9100';
    } else {
      col = '#ff1744';
    }
    return col;
  }

  onLOCChange(value, patient, i) {
    let config = new MatSnackBarConfig();
    config.verticalPosition = 'bottom';
    config.duration = 3000;
    config.panelClass = 'red-snackbar';
    
    if (value > 15) {
      patient.LOC = 15;
      console.log("Patient LOC must be <= 15");
      let res = this.snackBar.open("Patient LOC must be <= 15", '', config);

    } else if (value < 1) {
      patient.LOC = 1;
      console.log("Patient LOC must be > 0");
      let res = this.snackBar.open("Patient LOC must be > 0", '', config);

    } else {
      patient.LOC = value;
      this.dataSource.data = this.dataSource.data.concat();
      
    }
  }
}

