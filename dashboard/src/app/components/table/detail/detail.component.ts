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
      'key': this.patient['MRN'] + this.patient['Name'] + this.patient['Registration'],
      'numVitals': 0,
      'numBloodgas': 0,
    };
    let vitalDataArray = [];
    this.patient['ML'] = 0.0;
    if (this.patient['Vitals']) {
      this.patient['vitalsStatusWarning'] = 0;
      this.patient['vitalsStatusCaution'] = 0;
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
          if (test[j]['value'] < this.ranges[vitals[i]]['lowab'] || test[j]['value'] > this.ranges[vitals[i]]['uppab']) {
            outPatientRanges['maxVitals'] = 'warning';
            outPatientRanges['numVitals'] += 1;
            this.patient['vitalsStatusWarning'] += 1;
            this.checkSP(vitalData);
          } else {
            if (test[j]['value'] < this.ranges[vitals[i]]['lower'] || test[j]['value'] > this.ranges[vitals[i]]['upper']) {
              outPatientRanges['numVitals'] += 1;
              this.patient['vitalsStatusCaution'] += 1;
              this.checkAbnormal(vitalData);
              if (outPatientRanges['maxVitals'] != 'warning') {
                outPatientRanges['maxVitals'] = 'caution';
              }
            }
          }
          vitalDataArray.push(vitalData);
        }
      }
    }
    this.vitalSource = new MatTableDataSource(vitalDataArray);

    // add bloodgas information 
    let bloodgasDataArray = []
    if (this.patient['Bloodgas']) {
      this.patient['bloodgasStatusWarning'] = 0;
      this.patient['bloodgasStatusCaution'] = 0;
      let bloodgases: string[] = Object.keys(this.patient['Bloodgas']);
      let bloodgasLength = bloodgases.length;
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
            this.checkBEAndLactate(bloodData);
            this.patient['bloodgasStatusWarning'] += 1;
          } else {
            if (test[j]['value'] < this.ranges[bloodgases[i]]['lower'] || test[j]['value'] > this.ranges[bloodgases[i]]['upper']) {
              outPatientRanges['numBloodgas'] += 1;
              this.patient['bloodgasStatusCaution'] += 1;
                if (bloodData['test'] == "Lactate") {
                  if (this.patient['ML'] != null) {
                  this.patient['ML'] += (0.4*(1-this.patient['ML']));
                } else {
                  this.patient['ML'] = 0.4;
                } 
              }
              if (outPatientRanges['maxBloodgas'] != 'warning') {
                outPatientRanges['maxBloodgas'] = 'caution';
              }
            }
          }
          bloodgasDataArray.push(bloodData);
        }
      }
    }
    this.patientRanges.emit(outPatientRanges)
    this.bgSource = new MatTableDataSource(bloodgasDataArray);
  }
  private checkAbnormal(vitalData: { 'index': number; 'test': string; 'value': any; 'time': any; }) {
    if (vitalData['test'] == "Respiration Rate" || vitalData['test'] == "Pulse Rate" || vitalData['test'] == "Body Temperature") {    
      this.patient['ML'] += (0.4*(1-this.patient['ML']));
    } else if (this.patient['LOC'] < 13) { // critical range for BE and Lactate
      let tot = 15-3; 
      let add = (tot - (this.patient['LOC'] - 3))/tot * 0.15;
      this.patient['ML'] += (add*(1-this.patient['ML']));
    }
  }

  private checkSP(vitalData: { 'index': number; 'test': string; 'value': any; 'time': any; }) {
    if (vitalData['test'] == "Systolic Pressure") { // Critical Range for SP
      this.patient['ML'] += (0.9*(1-this.patient['ML']));
    }
  }

  private checkBEAndLactate(bloodData: { 'index': number; 'test': string; 'value': any; 'time': any; }) {
    if (bloodData['test'] == "BE" || bloodData['test'] == "Lactate") { // critical range for BE and Lactate
      if (this.patient['ML'] != 0 || this.patient['ML'] != null) { 
        this.patient['ML'] += (0.9*(1-this.patient['ML']));
      } else {
        this.patient['ML'] = 0.9;
      }
    }
  }

  
}