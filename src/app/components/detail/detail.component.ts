import { Component, OnInit, Input, Output } from '@angular/core';
import { Patient } from '../table/table.component';
import { MatTableDataSource, MatTable } from '@angular/material/table';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.css']
})
export class DetailComponent implements OnInit {

  checked = false;

  @Input() patient: Patient;
  displayedColumns: string[] = ['Stat', 'Lower', 'Value', 'Upper', 'Time'];
  data: string[] = ['BT', 'PR', 'RR', 'BP'];
  dataSource;
  
  zoneCol: string[] = ['none', 'YELLOW', 'RED'];
  lactateU: number = 2; // Greater than 4 mmol/L RED ZONE
  val:number = 3;
  selected:string = "Yes";
  loC: string = "Unresponsive";

  constructor() { }

  ngOnInit() {
    let patientDataArray = [
      {'stat': 'Body Temperature', 'lower': 35.5, 'upper': 38.5, 'value': this.patient.BT, 'time': this.patient.BT_time, 'color': this.zoneCol[0]},
      {'stat': 'Heart Rate', 'lower': 50, 'upper': 120, 'value': this.patient.PR, 'time': this.patient.PR_time, 'color': this.zoneCol[0]},
      {'stat': 'Respiration Rate', 'lower': 10, 'upper': 50, 'value': this.patient.RR, 'time': this.patient.RR_time, 'color': this.zoneCol[0]},
      {'stat': 'Blood Pressure', 'lower': 100, 'upper': 125, 'value': this.patient.BP, 'time': this.patient.BP_time, 'color': this.zoneCol[0]},
      {'stat': 'Blood Gas pH', 'lower': 7.35, 'upper': 7.45, 'value': this.patient.BG_pH, 'time': this.patient.BG_time, 'color': this.zoneCol[0]},
      {'stat': 'PaO₂', 'lower': 75, 'upper': 100, 'value': this.patient.PaO2, 'time': this.patient.BG_time, 'color': this.zoneCol[0]},
      {'stat': 'PaCO₂', 'lower': 35, 'upper': 45, 'value': this.patient.Pa_CO2, 'time': this.patient.BG_time, 'color': this.zoneCol[0]},      
      {'stat': 'HCO₃', 'lower': 22, 'upper': 26, 'value': this.patient.HCO3, 'time': this.patient.BG_time, 'color': this.zoneCol[0]},
      {'stat': 'SpO₂', 'lower': 95, 'upper': 100, 'value': '-', 'time': this.patient.BG_time, 'color': this.zoneCol[0]}      
    ];
    
    patientDataArray.forEach(element => {
      element.color = this.setColor(element.stat, element.value, element.lower, element.upper);
      console.log(element.color);
    });
    this.dataSource = new MatTableDataSource(patientDataArray);
  }

  setColor(stat, value, lower, upper) {
    switch(stat) {
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
}