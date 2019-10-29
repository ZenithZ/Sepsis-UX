import { Component, ViewChild, Input, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { animate, state, style, transition, trigger, sequence } from '@angular/animations';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { MatIconRegistry } from '@angular/material/icon';
import { isNull } from 'util';
import { ToastrService } from 'ngx-toastr';
import { take } from 'rxjs/operators';

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
    private changeDetector: ChangeDetectorRef, private toastr: ToastrService) { }
  showExceeded(message, patientName, patient) {
    this.toastr.warning(message, patientName, {
      titleClass: 'toast-title',
      onActivateTick: true
    }).onTap.pipe(take(1)).subscribe(() => this.toasterClickedHandler(patient));

  }

  @Input() title: string;
  @Input() patients: any[];
  @Input() filter: string;


  initialPush: boolean = true;
  myInterval;
  currentTime: Date;
  deltaTimeString: string;
  selectedRowIndex: number = -1;

  TREATMENT_ACUITY = {
    1: 0,
    2: 60 * 10,
    3: 60 * 30,
    4: 60 * 60,
    5: 60 * 120,
  };

  patientRanges = {};

  waitTimePatients = new Array<any>();
  waitTimeMessageDisplayed: boolean = false;
  waitTimeSnackActioned: boolean = false;

  atsGroup: number;
  displayedColumns: string[] = ['ATS', 'Seen', 'MRN', 'Name', 'DOB', 'Vitals', 'BG', 'LOC', 'Team', 'Delta', 'Sepsis'];
  expandedElement: any | null;
  highlighted: any | null;
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
    this.sort.sort({ id: "ML", start: 'desc', disableClear: true });
    this.dataSource.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'DOB': return this.calculateAge(item['DOB']);
        case 'Registration': return item['Registration'];
        case 'Vitals': return this.getVitalIndicatorValue(item);
        default: return item[property];
      }
    }
    this.dataSource.sort = this.sort;
    this.filter = "";
    this.currentTime = new Date();
    this.myInterval = setInterval(() => {
      this.setCurrentTime()
    }, 60000)
  }

  getVitalIndicatorValue(patient) {
    if (this.patientRanges != null && this.patientRanges[patient['MRN'] + patient['Name'] + patient['Registration']] != undefined) {
      let ret = this.patientRanges[patient['MRN'] + patient['Name'] + patient['Registration']]['numVitals'] > 0 ? this.patientRanges[patient['MRN'] + patient['Name'] + patient['Registration']]['numVitals'] : 0;
      return ret;
    } else {
      return ''
    }
  }
  toasterClickedHandler(patient) {
    let MRN: string = patient['MRN'];
    this.highlighted = patient;
    var elmnt = document.getElementById(MRN);
    elmnt.scrollIntoView(
      { 
        behavior: 'smooth', 
        block: 'center' 
      },
    );
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.hasOwnProperty('patients')) {
      if (changes.patients.currentValue !== undefined && !changes.patients.firstChange) {
        this.initialPush = false;
        this.dataSource.data = [...changes.patients.currentValue]
        this.changeDetector.detectChanges()
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

    let res = this.snackBar.open((patient['Seen'] ? 'Seen' : 'Unseen') + " " + patient['Name'], 'Undo', config);

    res.onAction().subscribe(() => {
      patient['Seen'] = !patient['Seen'];
    });
  }

  setExpanded(patient: any) {
    console.log(patient);

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
      if (days < 10) {
        ret += "0" + days + "d ";
      }
      else {
        ret += days + "d ";
      }
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
    // let exceeds = this.getWaitTime(patient) > this.TREATMENT_ACUITY[patient['ATS']];

    // if ((exceeds && patient['notified'] == null || exceeds && patient['notified'] == false)) {
    //   this.notifyPatientWaiting(patient);
    //   patient['notified'] = true;


    // } else if (exceeds == false) {
    //   patient['notified'] = false;
    // }
    // return exceeds;
    let exceeds = patient['ML'] >= 0.8;

    if (exceeds == true && patient['notified'] == false) {
      this.notifyPatientRisk(patient);
      patient['notified'] = true;
    } else if (exceeds == false) {
      patient['notified'] = false;
    }

    return exceeds;
  }

  getStatus(patient: any) {
    let color = "whitesmoke";
    if (patient['ML'] < 0.1) {
      return color;
    } else if (patient['ML'] >= 0.8) {
      return "#e53935"; // RED
    } else if (patient['ML'] > 0.4) {
      color = "#fed44c"; // YELLOW
    }
    return color;
  }

  notifyPatientWaiting(patient: any) {
    let time: string = this.formatWaitTime(patient);
    let message: string = "Exceeded the waiting threshold! (" + time + ")";
    let patientName: string = patient['First Name'] + " " + patient['Last Name'];


    this.toastr.warning(message, patientName, {
      titleClass: 'toast-title',
      positionClass: 'toast-top-right',
      closeButton: true,
      onActivateTick: true
    }).onTap.pipe(take(1)).subscribe(() => this.toasterClickedHandler(patient));

  }

  notifyPatientRisk(patient: any) {
    let risk: number = patient['ML']
    let message: string = "has a sepsis risk of " + Math.ceil(risk * 100) + "%." + "\n" + "Click to view";
    let patientName: string = patient['First Name'] + " " + patient['Last Name'];


    this.toastr.warning(message, patientName, {
      titleClass: 'toast-title',
      positionClass: 'toast-top-right',
      closeButton: true,
      onActivateTick: true
    }).onTap.pipe(take(1)).subscribe(() => this.toasterClickedHandler(patient));

  }

  highlight(patient: any) {
    patient['highlight'] = true;
  }

  undoHighlight(patient: any) {
    patient['highlight'] = false;
  }

  setPatientRanges(ranges) {
    let key = ranges['key'];
    delete ranges['key'];
    this.patientRanges[key] = ranges
    this.changeDetector.detectChanges()
  }

  calculateAge(dob) {
    var parts = dob.split("/");
    var dt = new Date(parseInt(parts[2], 10),
      parseInt(parts[1], 10) - 1,
      parseInt(parts[0], 10));

    let ageInSec = Math.floor((this.currentTime.getTime() - dt.getTime()) / 1000);
    var age = Math.floor(ageInSec / 31536000);

    return age;
  }

}