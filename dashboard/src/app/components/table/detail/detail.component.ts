import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import sampleRanges from '../../../../../REST-ranges.json';
import { keyframes } from '@angular/animations';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.css']
})
export class DetailComponent implements OnInit {


  @Input() patient: any;
  @Output() patientRanges = new EventEmitter();

  displayedColumns: string[] = ['Test', 'Value', 'Lower Interval', 'Upper Interval', 'Time'];
  // vitalSource: MatTableDataSource<any>;
  // bgSource: MatTableDataSource<any>;

  ranges: any = sampleRanges;
  vitalsTests: any;
  bloodgasTests: any;
  vitalsTimes = [];
  bloodgasTimes = [];
  vitalSources: MatTableDataSource<any>[] = [];
  bgSources: MatTableDataSource<any>[] = [];

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
            'outOfRange': false
          }
          if (test[j]['value'] < this.ranges[vitals[i]]['lowab'] || test[j]['value'] > this.ranges[vitals[i]]['uppab']) {
            outPatientRanges['maxVitals'] = 'warning';
            outPatientRanges['numVitals'] += 1;
            this.patient['outOfRangeVitals'] += 1;
            vitalData['outOfRange'] = true;
          } else {
            if (test[j]['value'] < this.ranges[vitals[i]]['lower'] || test[j]['value'] > this.ranges[vitals[i]]['upper']) {
              outPatientRanges['numVitals'] += 1;
              vitalData['outOfRange'] = true;
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
    // this.vitalSource = new MatTableDataSource(vitalDataArray);
    this.vitalsTests = this.orderTests(vitalDataArray, this.vitalsTimes, 'vitals');

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
            'outOfRange': false
          }
          
          if (test[j]['value'] < this.ranges[bloodgases[i]]['lowab'] || test[j]['value'] > this.ranges[bloodgases[i]]['uppab']) {
            outPatientRanges['maxBloodgas'] = 'warning';
            outPatientRanges['numBloodgas'] += 1;
            bloodData['outOfRange'] = true;
          } else {
            if (test[j]['value'] < this.ranges[bloodgases[i]]['lower'] || test[j]['value'] > this.ranges[bloodgases[i]]['upper']) {
              outPatientRanges['numBloodgas'] += 1;
              bloodData['outOfRange'] = true;
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
    // this.bgSource = new MatTableDataSource(bloodgasDataArray);
    this.bloodgasTests = this.orderTests(bloodgasDataArray, this.bloodgasTimes, 'bloodgas');
  }
  
  orderTests(tests, testTimes, type) {
    
    let testsByTime = [];
    let times = [];
    
    if (tests == null || tests.length < 1) {
      return [];
    }

    for (let i = 0; i < tests.length; i++) {
      let index = tests[i]['index'];
      if (times.indexOf(index) < 0) {
        times.push(index);
        testTimes.push(index);
        testsByTime[index] = [tests[i]];
      } else {
        testsByTime[index].push(tests[i]);
      }
    }

    testsByTime.reverse();

    for (let i = 0; i < testsByTime.length; i++) {
      if (type == 'vitals') {
        this.vitalSources[i] = new MatTableDataSource(testsByTime[i]);
      } else {
        this.bgSources[i] = new MatTableDataSource(testsByTime[i]);
      }
    }
    
    return testsByTime;
  }

  countOutOfRange(data) {
    let outOfRange = 0;
    for (let i = 0; i < data.length; i++) {
      if (data[i]['outOfRange']) {
        outOfRange += 1;
      }
    }
    return outOfRange;
  }
}