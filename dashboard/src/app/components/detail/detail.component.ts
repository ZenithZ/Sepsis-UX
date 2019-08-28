import { Component, OnInit, Input, Output } from '@angular/core';
import { Patient } from '../table/table.component';
import { MatTableDataSource, MatTable } from '@angular/material/table';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.css']
})
export class DetailComponent implements OnInit {

  @Input() patient: Patient;

  displayedColumns: string[] = ['Stat', 'Value', 'Range', 'Time'];
  data: string[] = ['BT', 'PR', 'RR', 'BP'];
  dataSource;

  val:number = 3;
  selected:string = "Yes";
  loC: string = "Unresponsive";

  constructor() { }

  ngOnInit() {
    let patientDataArray = [
      {'stat': 'Body Temperature', 'range': 'Temp ≥ 35.5 and ≤ 38.5', 'value': this.patient.BT, 'time': this.patient.BT_time},
      {'stat': 'Heart Rate', 'range': 'Pulse > 50 and < 120', 'value': this.patient.PR, 'time': this.patient.PR_time},
      {'stat': 'Respiration Rate', 'range': 'Breaths per minute > 10 and < 50', 'value': this.patient.RR, 'time': this.patient.RR_time},
      {'stat': 'Blood Pressure', 'range': 'SBP ≥ 100mmHg', 'value': this.patient.BP, 'time': this.patient.BP_time},
      {'stat': 'Blood Gas pH', 'range': '7.35 - 7.45', 'value': this.patient.BG_pH, 'time': this.patient.BG_time},
      {'stat': 'PaO₂', 'range': '75 to 100 mmHg', 'value': this.patient.PaO2, 'time': this.patient.BG_time},
      {'stat': 'PaCO₂', 'range': '35 to 45 mmHg', 'value': this.patient.Pa_CO2, 'time': this.patient.BG_time},      
      {'stat': 'HCO₃', 'range': '22 - 26 mEq/L', 'value': this.patient.HCO3, 'time': this.patient.BG_time},
      {'stat': 'SpO₂', 'range': 'SpO₂ ≥ 95%', 'value': '-', 'time': this.patient.BG_time}      
    ];
    this.dataSource = new MatTableDataSource(patientDataArray);
  }
  
  formatLabel(value:number) {
    return DetailComponent.getLabel(value);
  }


  setLoCText() {
    this.loC = DetailComponent.getLabel(this.val);
  }

  // Returns the stringified qualitative description of the level of consciousness
  static getLabel(value:number) {
    switch(value) {
      case 3:
        return "Unresponsive";
      case 5:
        return "Pain";
      case 10:
        return "Verbal";
      case 15:
        return "Alert";
      default:
        return value.toString();
    }
  }

  change_value_by_simple_select() {
      switch(this.loC) {
        case "Unresponsive":
          this.val = 3;
          break;
        case "Pain":
          this.val = 5;
          break;
        case "Verbal":
          this.val = 10;
          break;
        case "Alert":
          this.val = 15;
          break;
        default:
          this.val = this.val;
          break;
      }
  }
}