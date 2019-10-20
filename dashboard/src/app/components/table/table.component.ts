import { Component, ViewChild, Input, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { animate, state, style, transition, trigger, sequence } from '@angular/animations';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import {MatIconRegistry} from '@angular/material/icon';
import { isNull } from 'util';

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
  displayedColumns: string[] = ['ATS', 'Seen', 'MRN', 'Name', 'DOB', 'LOC', 'Vitals', 'BG', 'Team', 'Delta', 'Sepsis'];
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
    this.sort.sort({ id: "ML", start: 'desc', disableClear: true});
    this.dataSource.sort = this.sort;
    this.filter = "";
    this.currentTime = new Date();
    this.myInterval = setInterval(() => {
      this.setCurrentTime()
    }, 60000)
  }

  ngOnChanges(changes: SimpleChanges) {
    // console.log(changes)
    if (changes.hasOwnProperty('patients')) {
      if (changes.patients.currentValue !== undefined && !changes.patients.firstChange) {
        // console.log('changed!!')
        this.initialPush = false;
        this.dataSource.data = [...changes.patients.currentValue]
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
    let exceeds = this.getWaitTime(patient) > this.TREATMENT_ACUITY[patient['ATS']];
   
    if ((exceeds && patient['notified'] == null || exceeds && patient['notified'] == false)) {
      this.notifyPatientWaiting(patient);
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
      
    this.waitTimeSnackActioned = false;
    if (patient != null) { // Patient is given to check
      this.waitTimePatients.push(patient);
    } 
    
    
    if (this.waitTimeMessageDisplayed == false && this.waitTimePatients.length >= 1) {
      
      this.waitTimeMessageDisplayed = true;

      let config = new MatSnackBarConfig();
      config.verticalPosition = 'top';
      config.horizontalPosition = 'right';
      config.duration = 10000;
      config.panelClass = ['patient-waiting-snack-bar'];

      let patient = this.waitTimePatients.shift();

      let time: String = this.formatWaitTime(patient);
      let message: String = patient['First Name'] + " " + patient['Last Name'] + " has exceeded the waiting threshold! ("+time+")";
      let MRN: String = patient['MRN'];
      let res = this.snackBar.open(message.toString(), 'Show', config);
      var elmnt = document.getElementById(MRN.toString());
      res.onAction().subscribe(() => {
        elmnt.scrollIntoView();
        this.setExpanded(patient);
        this.highlight(patient);
        this.waitTimeMessageDisplayed = false;
        this.waitTimeSnackActioned = true;
        this.notifyPatientWaiting(null); // Go to the next message in line.
      });
      res.afterDismissed().subscribe((info) => {
        if (info.dismissedByAction === false) {
          this.waitTimeMessageDisplayed = false;
          this.notifyPatientWaiting(null);
        } 
      })
    
    } else {

    }
    
    
    
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
  }

  onLOCChange(value, patient, i) {
    // let config = new MatSnackBarConfig();
    // config.verticalPosition = 'bottom';
    // config.duration = 3000;
    // config.panelClass = 'red-snackbar';
    if (value > 15) {
      patient.LOC = 15;
    } else if (value < 1) {
      patient.LOC = 1;
    } else {
      patient.LOC = value;
      this.dataSource.data = this.dataSource.data.concat();
    }
  }

  getErrorMessage(patient) {
    if (patient['locValue'].hasError('required')) {
      return 'Value required'
    }
    if (patient['locValue'].value > 99) {
      patient['locValue'].reset('99')
      patient['locValue'].setErrors({'max': true});
    }

    if (patient['locValue'].value < 1) {
      patient['locValue'].reset('1')
      patient['locValue'].setErrors({'min': true, 'required': false})
    }    
    return patient['locValue'].hasError('required') ? 'Value required' :
        patient['locValue'].hasError('max') ? 'Too large' :
        patient['locValue'].hasError('min') ? 'Too small' :
            '';
  }

}