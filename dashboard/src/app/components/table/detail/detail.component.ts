import { Component, OnInit, Input, Output } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import sampleRanges from '../../../../../REST-ranges.json';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.css']
})
export class DetailComponent implements OnInit {


  @Input() patient: any;

  displayedColumns: string[] = ['Test', 'Value', 'Lower Interval', 'Upper Interval', 'Time'];
  vitalSource: MatTableDataSource<any>;
  bgSource: MatTableDataSource<any>;

  ranges: any = sampleRanges;

  ngOnInit() {
    // add vital information
    let vitalDataArray = [];
    if (this.patient['Vitals']) {
      let vitals: string[] = Object.keys(this.patient['Vitals']);
      let vitalLength = vitals.length;
      for (let i = 0; i < vitalLength; i++) {
        let test = this.patient['Vitals'][vitals[i]];
        let testLength = test.length;
        for (let j = 0; j < testLength; j++) {
          let vitalData = {
            'index': j,
            'test': vitals[i],
            'value': test[j]['value'],
            'time': test[j]['time'],
          }
          vitalDataArray.push(vitalData);
        }
      }
    }
    this.vitalSource = new MatTableDataSource(vitalDataArray);

    // add bloodgas information 
    let bloodgasDataArray = []
    if (this.patient['Bloodgas']) {
      let bloodgases: string[] = Object.keys(this.patient['Bloodgas']);
      let bloodgasLength = bloodgases.length;
      for (let i = 0; i < bloodgasLength; i++) {
        let test = this.patient['Bloodgas'][bloodgases[i]];
        let testLength = test.length;
        for (let j = 0; j < testLength; j++) {
          let bloodData = {
            'index': j,
            'test': bloodgases[i],
            'value': this.patient['Bloodgas'][bloodgases[i]]['value'],
            'time': this.patient['Bloodgas'][bloodgases[i]]['time'],
          }
          bloodgasDataArray.push(bloodData);
        }
      }
    }
    this.bgSource = new MatTableDataSource(bloodgasDataArray);
  }
}