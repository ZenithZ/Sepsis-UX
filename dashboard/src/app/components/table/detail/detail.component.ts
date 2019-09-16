import { Component, OnInit, Input, Output } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import sampleRanges from '../../../../../REST-ranges.json';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.css']
})
export class DetailComponent implements OnInit {

  checked = false;

  @Input() patient: any;

  displayedColumns: string[] = ['Test', 'Value', 'Lower Interval', 'Upper Interval', 'Time'];
  vitalSource: MatTableDataSource<any>;
  bgSource: MatTableDataSource<any>;

  ranges: any = sampleRanges;
  zoneCol: string[] = ['none', 'YELLOW', 'RED'];
  lactateU: number = 2; // Greater than 4 mmol/L RED ZONE
  val: number = 3;
  selected: string = "Yes";
  loC: string = "Alert";
  editField: number;
  fullname: string;
  // Flag used for sorting
  static readonly FLAGS = {
    CRITICAL: 2,
    ABNORMAL: 1,
    NORMAL: 0
  };

  constructor() { }

  ngOnInit() {
    // add vital information
    this.patient['Fullname'] = this.patient['First Name'] + ' ' + this.patient['Last Name'];
    let vitalDataArray = [];
    if (this.patient['Vitals']) {
      let vitals: string[] = Object.keys(this.patient['Vitals']);
      let vitalLength = vitals.length;
      for (let i = 0; i < vitalLength; i++) {
        vitalDataArray.push({
          'test': vitals[i],
          'value': this.patient['Vitals'][vitals[i]]['value'],
          'time': this.patient['Vitals'][vitals[i]]['time'],
        })
      }
    }
    this.vitalSource = new MatTableDataSource(vitalDataArray);

    // add bloodgas information 
  let bloodgasDataArray = []
    if (this.patient['Bloodgas']) {
      let bloodgases: string[] = Object.keys(this.patient['Bloodgas']);
      let bloodgasLength = bloodgases.length;
      for (let i = 0; i < bloodgasLength; i++) {
        bloodgasDataArray.push({
          'test': bloodgases[i],
          'value': this.patient['Bloodgas'][bloodgases[i]]['value'],
          'time': this.patient['Bloodgas'][bloodgases[i]]['time'],
        })
      }
    }
    this.bgSource = new MatTableDataSource(bloodgasDataArray);
  }

  changeValue(property: string, event: any) {
    this.editField = event.target.textContent;
  }

  updateList(property: string, event: any) {
    const editField = parseFloat(event.target.textContent);
    this.patient['Vitals'][property] = editField;
  }
  
}