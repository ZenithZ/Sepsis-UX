import { Component, ViewChild, Input, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { animate, state, style, transition, trigger, sequence } from '@angular/animations';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { ToastrService } from 'ngx-toastr';
import { take } from 'rxjs/operators';
import { MatTab } from '@angular/material/tabs';

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

  showExceeded(message, patient) {
    this.toastr.warning(message, patient['Name'], {
      titleClass: 'toast-title',
      onActivateTick: true
    }).onTap.pipe(take(1)).subscribe(() => this.toasterClickedHandler(patient));
  }

  @Input() title: string;
  @Input() patients: any[];
  @Input() view: string;
  @Input() filter: string;


  initialPush: boolean = true;
  viewPatients: any[];
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
        case 'Bloodgas': return this.getBloodgasIndicatorValue(item);
        case 'ML': return item.hasOwnProperty('Overridden') ? item['Overridden'] ? 1 : item['ML'] : item['ML']
        default: return item[property];
      }
    }

    this.dataSource.sort = this.sort;
    this.filter = "";
    this.currentTime = new Date();
    this.myInterval = setInterval(() => {
      this.setCurrentTime();
    }, 60000)
  }

  ngAfterViewChecked(): void {
    //Called after every check of the component's view. Applies to components only.
    //Add 'implements AfterViewChecked' to the class.

  }

  getVitalIndicatorValue(patient) {
    if (this.patientRanges != null && this.patientRanges[patient['MRN']] != undefined) {
      return this.patientRanges[patient['MRN']]['numVitals']
    }
    return -1
  }

  getBloodgasIndicatorValue(patient) {
    if (this.patientRanges != null && this.patientRanges[patient['MRN']] != undefined) {
      return this.patientRanges[patient['MRN']]['numBloodgas']
    }
    return -1
  }

  toasterClickedHandler(patient) {
    let MRN: string = patient['MRN'];
    var elmnt = document.getElementById(MRN);
    patient['Highlight'] = true;
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
        this.dataSource.data = [...this.dataSource.data];
        this.changeDetector.detectChanges()
      }
      for (let i = 0; i < this.patients.length; i++) {
        this.exceedsRisk(this.patients[i]);
      }
    }
    if (changes.hasOwnProperty('filter')) {
      if (changes.filter.currentValue !== undefined) {
        this.applyFilter(changes.filter.currentValue);
        this.dataSource._updateChangeSubscription();
      }
    }
  }

  overrideRisk(patient: any) {
    if (!patient.hasOwnProperty('Overridden')) {
      patient['Overridden'] = true;
    } else {
      patient['Overridden'] = !patient['Overridden'];
    }
    this.dataSource._updateChangeSubscription();
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
    let MRN = patient['MRN'];
    if (this.expandedElement != undefined && this.expandedElement === MRN) {
      this.expandedElement = null;
    } else {
      if (patient.hasOwnProperty('Vitals') || patient.hasOwnProperty('Bloodgas')) {
        this.expandedElement = MRN;
      }
    }
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
    return this.getWaitTime(patient) > this.TREATMENT_ACUITY[patient['ATS']];
  }

  exceedsRisk(patient: any) {
    let exceeds = patient['ML'] >= 0.8;

    if (exceeds == true && !patient['Notified']) {
      this.notifyPatientRisk(patient);
      patient['Notified'] = true;
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
    };
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

  setPatientRanges(ranges) {
    let key = ranges['key'];
    delete ranges['key'];
    this.patientRanges[key] = ranges
    this.changeDetector.detectChanges()
  }

  forceML(patient) {

    if (patient['ML'] <= 0.5 || patient['previousML'] != null) {
      if (patient.sepsis == true) {
        patient['previousML'] = patient['ML'];
        patient['ML'] = 0.5;
      } else {
        patient['ML'] = patient['previousML'];
      }
    } else {
      patient.sepsis = false;
    }
    this.dataSource._updateChangeSubscription();
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