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
  dataSource: MatTableDataSource<any>;

  ranges: any = sampleRanges;
  zoneCol: string[] = ['none', 'YELLOW', 'RED'];
  lactateU: number = 2; // Greater than 4 mmol/L RED ZONE
  val: number = 3;
  selected: string = "Yes";
  loC: string = "Alert";
  editField: string;
  // Flag used for sorting
  static readonly FLAGS = {
    CRITICAL: 2,
    ABNORMAL: 1,
    NORMAL: 0
  };

  constructor() { }

  ngOnInit() {
    // add vital information
    let patientDataArray = []
    if (this.patient['Vitals']) {
      let vitals: string[] = Object.keys(this.patient['Vitals']);
      let vitalLength = vitals.length;
      for (let i = 0; i < vitalLength; i++) {
        patientDataArray.push({
          'test': vitals[i],
          'value': this.patient['Vitals'][vitals[i]]['value'],
          'time': this.patient['Vitals'][vitals[i]]['time'],
          'color': this.setColor(vitals[i], this.patient['Vitals'][vitals[i]]),
        })
      }
    }
    this.dataSource = new MatTableDataSource(patientDataArray);
  }

  setColor(test, stat) {
    let col = this.zoneCol[0];
    let bounds = this.ranges[test];
    stat['risk'] = DetailComponent.FLAGS.NORMAL;

    if (stat['value'] < bounds['lower'] || stat['value'] > bounds['upper']) {
      col = this.zoneCol[2];
      stat['risk'] = DetailComponent.FLAGS.CRITICAL;
    } else if (bounds.hasOwnProperty('uppab') && stat['value'] > bounds['uppab']) {
        stat['risk'] = DetailComponent.FLAGS.ABNORMAL;
        col = this.zoneCol[1];
    } else if (bounds.hasOwnProperty('lowab') && stat['value'] < bounds['lowab']) {
        stat['risk'] = DetailComponent.FLAGS.ABNORMAL;
        col = this.zoneCol[1];
    }
    return col;
  }

  changeValue(property: string, event: any) {
    this.editField = event.target.textContent;
  }

  updateList(property: string, event: any) {
    const editField = event.target.textContent;
    this.patient['Vitals'][property] = editField;
  }
  
}