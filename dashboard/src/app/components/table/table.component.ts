import { Component, ViewChild, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { SelectionModel, DataSource } from '@angular/cdk/collections';
import { FormControl, Validators } from '@angular/forms';

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

  getATS(patient: any) {
    return patient['ATS'][0];
  }

  getTime() {
    this.currentTime = new Date();
  }

  getWaitTime(patient: any) {
    let waitTime = Math.floor((this.currentTime.getTime() - Date.parse(patient['Registration'])) / 1000);
    let temp = Math.floor(waitTime / (3600*3600*24))

    if (this.getATS(patient) == 1) {
      if (temp >= 1) 
        this.snackBar.open(patient['First Name'] + " " + patient['Last Name'] + " in ATS 1 has been waiting for over 1 minute.", 'Noticed', {duration: 99999});
    }
    else if (this.getATS(patient) == 2) {
      if (temp >= 10) 
        this.snackBar.open(patient['First Name'] + " " + patient['Last Name'] + " in ATS 2 has been waiting for over 10 minitues.", 'Noticed', {duration: 99999});
    }
    else if (this.getATS(patient) == 3) {
      if (temp >= 30) 
        this.snackBar.open(patient['First Name'] + " " + patient['Last Name'] + " in ATS 3 has been waiting for over 30 minutes.", 'Noticed', {duration: 99999});
    }
    else if (this.getATS(patient) == 4) {
      if (temp >= 60) 
        this.snackBar.open(patient['First Name'] + " " + patient['Last Name'] + " in ATS 4 has been waiting for over an hour.", 'Noticed', {duration: 99999});
    }
    else if (this.getATS(patient) == 5) {
      if (temp >= 120) 
        this.snackBar.open(patient['First Name'] + " " + patient['Last Name'] + " in ATS 5 has been waiting for over two hours.", 'Noticed', {duration: 99999});
    }
    else {
      if (temp >= 120) 
        this.snackBar.open(patient['First Name'] + " " + patient['Last Name'] + " has been uncatogorised for over a day.", 'Noticed', {duration: 99999});
    }

    return waitTime
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
    //let locValue = new FormControl('', [Validators.required, Validators.max(15), Validators.min(3)]);
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

