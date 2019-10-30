import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import sampleRanges from '../../../../../REST-ranges.json';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.css']
})
export class DetailComponent implements OnInit {


  @Input() patient: any;
  @Output() patientRanges = new EventEmitter();

  displayedColumns: string[] = ['Test', 'Value', 'Lower Interval', 'Upper Interval', 'Time'];
  vitalSource: MatTableDataSource<any>;
  bgSource: MatTableDataSource<any>;

  ranges: any = sampleRanges;

  ngOnInit() {
    // add vital information
    let outPatientRanges = {
      'key': this.patient['MRN'],
      'numVitals': -1,
      'numBloodgas': -1,
    };
    let vitalDataArray = [];
    if (this.patient['Vitals']) {
      let vitals: string[] = Object.keys(this.patient['Vitals']);
      let vitalLength = vitals.length;
      if (vitalLength > 0) {
        outPatientRanges['numVitals'] = 0
      }
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
          if (test[j]['value'] < this.ranges[vitals[i]]['lowab'] || test[j]['value'] > this.ranges[vitals[i]]['uppab']) {
            outPatientRanges['maxVitals'] = 'warning';
            outPatientRanges['numVitals'] += 1;
            this.patient['outOfRangeVitals'] += 1;
          } else {
            if (test[j]['value'] < this.ranges[vitals[i]]['lower'] || test[j]['value'] > this.ranges[vitals[i]]['upper']) {
              outPatientRanges['numVitals'] += 1;
              if (outPatientRanges['maxVitals'] != 'warning') {
                outPatientRanges['maxVitals'] = 'caution';
              }
            }
          }
          vitalDataArray.push(vitalData);
        }
      }
      this.patient['numVitals'] = outPatientRanges['numVitals'];
    }
    this.vitalSource = new MatTableDataSource(vitalDataArray);

    // add bloodgas information 
    let bloodgasDataArray = []
    if (this.patient['Bloodgas']) {
      let bloodgases: string[] = Object.keys(this.patient['Bloodgas']);
      let bloodgasLength = bloodgases.length;
      if (bloodgasLength > 0) {
        outPatientRanges['numBloodgas'] = 0
      }
      for (let i = 0; i < bloodgasLength; i++) {
        let test = this.patient['Bloodgas'][bloodgases[i]];
        let testLength = test.length;
        for (let j = 0; j < testLength; j++) {
          let bloodData = {
            'index': j,
            'test': bloodgases[i],
            'value': test[j]['value'],
            'time': test[j]['time'],
          }
          
          if (test[j]['value'] < this.ranges[bloodgases[i]]['lowab'] || test[j]['value'] > this.ranges[bloodgases[i]]['uppab']) {
            outPatientRanges['maxBloodgas'] = 'warning';
            outPatientRanges['numBloodgas'] += 1;
          } else {
            if (test[j]['value'] < this.ranges[bloodgases[i]]['lower'] || test[j]['value'] > this.ranges[bloodgases[i]]['upper']) {
              outPatientRanges['numBloodgas'] += 1;
              if (outPatientRanges['maxBloodgas'] != 'warning') {
                outPatientRanges['maxBloodgas'] = 'caution';
              }
            }
          }
          bloodgasDataArray.push(bloodData);
        }
      }
      this.patient['numBloodgas'] = outPatientRanges['numBloodgas'];
    }
    this.patientRanges.emit(outPatientRanges)
    this.bgSource = new MatTableDataSource(bloodgasDataArray);
  }
  
}