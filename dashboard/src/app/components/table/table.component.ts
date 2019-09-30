import { Component, ViewChild, Input, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { animate, state, style, transition, trigger, sequence } from '@angular/animations';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed, void', style({ height: '0px', minHeight: '0', visibility: 'hidden' })),
      state('expanded', style({ height: '*', visibility: 'visible' })),
      transition('expanded <=> collapsed', animate('250ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
      transition('expanded <=> void', animate('250ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
    trigger('rowsAnimation', [
      transition('void => *', [
        style({ height: '*', opacity: '0', transform: 'translateX(-550px)', 'box-shadow': 'none' }),
        sequence([
          animate(".35s ease", style({ height: '*', opacity: '.2', transform: 'translateX(0)', 'box-shadow': 'none' })),
          animate(".35s ease", style({ height: '*', opacity: 1, transform: 'translateX(0)' }))
        ])
      ])
    ]),
  ]
})

export class TableComponent implements OnChanges {

  constructor(private snackBar: MatSnackBar,
    private changeDetector: ChangeDetectorRef) { }

  @Input() title: string;
  @Input() patients: any[];
  @Input() filter: string;
  @Input() push: any[];

  initialPush: boolean = true;
  myInterval;
  currentTime: Date;
  deltaTimeString: string;

  TREATMENT_ACUITY = {
    1: 0,
    2: 60 * 10,
    3: 60 * 30,
    4: 60 * 60,
    5: 60 * 120,
  };

  patientRanges = {};

  atsGroup: number;
  displayedColumns: string[] = ['ATS', 'Seen', 'MRN', 'Name', 'DOB', 'LOC', 'Vitals', 'BG', 'Registration', 'Delta'];
  expandedElement: any | null;
  dataSource: MatTableDataSource<any>;
  ranges;

  @ViewChild(MatSort, { static: true }) sort: MatSort;

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim().toLowerCase();

    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  ngOnInit() {
    this.atsGroup = parseInt(this.title.split(" ")[1])
    this.dataSource = new MatTableDataSource(this.patients);
    this.dataSource.sort = this.sort;
    this.filter = "";
    this.currentTime = new Date();
    this.myInterval = setInterval(() => {
      this.setCurrentTime()
    }, 60000)
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.hasOwnProperty('push')) {
      if (changes.push.currentValue !== undefined && !changes.push.firstChange) {
        this.initialPush = false;
        this.dataSource.data.push(changes.push.currentValue);
        this.dataSource.data = [...this.dataSource.data]
      }
    }
    if (changes.hasOwnProperty('filter')) {
      if (changes.filter.currentValue !== undefined) {
        this.applyFilter(changes.filter.currentValue);
      }
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

  setExpanded(patient: any) {
    if (this.expandedElement === patient) {
      this.expandedElement = null;
    } else {
      if (patient.hasOwnProperty('Vitals') || patient.hasOwnProperty('Bloodgas')) {
        this.expandedElement = patient;
      }
    }
    this.changeDetector.detectChanges()
  }

  setCurrentTime() {
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
      ret += days + "d ";
    }
    if (hrs <= 9) {
      ret += "0";
    }
    ret += hrs + ":"
    if (mnts <= 9) {
      ret += "0";
    }
    ret += mnts;
    return ret;
  }

  exceedsAcuity(patient: any) {
    let exceeds = this.getWaitTime(patient) > this.TREATMENT_ACUITY[patient['ATS']];
    return exceeds;
  }

  setPatientRanges(ranges) {
    let key = ranges['key'];
    delete ranges['key'];
    this.patientRanges[key] = ranges
    this.changeDetector.detectChanges()
  }
}