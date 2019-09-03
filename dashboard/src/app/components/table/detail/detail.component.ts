import { Component, OnInit, Input, Output } from '@angular/core';
import { MatTableDataSource, MatTable } from '@angular/material/table';
import sampleRanges from '../../../../../REST-ranges.json';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.css']
})
export class DetailComponent implements OnInit {

  checked = false;

  @Input() patient: any;

  displayedColumns: string[] = ['Test', 'Lower Interval', 'Value', 'Upper Interval', 'Time'];
  dataSource: MatTableDataSource<any>;

  ranges: any = sampleRanges;
  zoneCol: string[] = ['none', 'YELLOW', 'RED'];
  lactateU: number = 2; // Greater than 4 mmol/L RED ZONE
  val: number = 3;
  selected: string = "Yes";
  loC: string = "Alert";
  editField:string;

  constructor() { }

  ngOnInit() {
    // add vital information
    var vitals: string[] = Object.keys(this.patient['Vitals'])
    var vitalLength = vitals.length;
    var patientDataArray = []
    for (var i = 0; i < vitalLength; i++) {
      patientDataArray.push({
        'test': vitals[i],
        'value': this.patient['Vitals'][vitals[i]]['value'],
        'time': this.patient['Vitals'][vitals[i]]['time'],
      })
    }

    // let patientDataArray = [
    //   {'id': 1, 'stat': 'Body Temperature', 'lower': 35.5, 'upper': 38.5, 'value': this.patient.BT, 'time': this.patient.BT_time, 'color': this.zoneCol[0]},
    //   {'id': 2, 'stat': 'Heart Rate', 'lower': 50, 'upper': 120, 'value': this.patient.PR, 'time': this.patient.PR_time, 'color': this.zoneCol[0]},
    //   {'id': 3, 'stat': 'Respiration Rate', 'lower': 10, 'upper': 50, 'value': this.patient.RR, 'time': this.patient.RR_time, 'color': this.zoneCol[0]},
    //   {'id': 4, 'stat': 'Blood Pressure', 'lower': 100, 'upper': 125, 'value': this.patient.BP, 'time': this.patient.BP_time, 'color': this.zoneCol[0]},
    //   {'id': 5, 'stat': 'Blood Gas pH', 'lower': 7.35, 'upper': 7.45, 'value': this.patient.BG_pH, 'time': this.patient.BG_time, 'color': this.zoneCol[0]},
    //   {'id': 6, 'stat': 'PaO₂', 'lower': 75, 'upper': 100, 'value': this.patient.PaO2, 'time': this.patient.BG_time, 'color': this.zoneCol[0]},
    //   {'id': 7, 'stat': 'PaCO₂', 'lower': 35, 'upper': 45, 'value': this.patient.Pa_CO2, 'time': this.patient.BG_time, 'color': this.zoneCol[0]},      
    //   {'id': 8, 'stat': 'HCO₃', 'lower': 22, 'upper': 26, 'value': this.patient.HCO3, 'time': this.patient.BG_time, 'color': this.zoneCol[0]},
    //   {'id': 9, 'stat': 'SpO₂', 'lower': 95, 'upper': 100, 'value': '-', 'time': this.patient.BG_time, 'color': this.zoneCol[0]}   
    // ];

    this.dataSource = new MatTableDataSource(patientDataArray);
  }

  setColor(stat, value, lower, upper) {
    switch (stat) {
      case "Respiration Rate":
      case "Heart Rate":
      //case "Altered Level of Conciousness":
      case "Body Temperature":
        if (value < lower || value > upper) {
          return this.zoneCol[1]; // Set to yellow
        } else {
          return this.zoneCol[0]; // set to none
        }
      case "Blood Pressure":
        if (value < 90) {
          return this.zoneCol[2]; // Set to red
        } else if (value < 100 || value > 125) {
          return this.zoneCol[1]; // set to yellow
        } else {
          return this.zoneCol[0]; // set to none
        }
      case "SpO₂":
        if (value < lower) {
          return this.zoneCol[1]; // set to yellow
        }
      default:
        return this.zoneCol[0];
      //Need to implement lactate values


    }
  }

  changeValue(property: string, event: any) {
    this.editField = event.target.textContent;
  }

  updateList(property: string, event: any) {
    const editField = event.target.textContent;
    this.patient['Vitals']['property']['value'] = editField;
  }
  
}