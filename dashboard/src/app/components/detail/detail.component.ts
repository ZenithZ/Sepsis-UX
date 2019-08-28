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

  val:number = 15;
  selected:string = "Yes";
  loC: string = "Alert";

  constructor() { }

  ngOnInit() {
    let patientDataArray = [
      {'stat': 'Body Temperature', 'range': '35.5 < temp < 38.5', 'value': this.patient.BT, 'time': this.patient.BT_time},
      {'stat': 'Heart Rate', 'range': '50 ≤ pulse ≤ 120', 'value': this.patient.PR, 'time': this.patient.PR_time},
      {'stat': 'Respiration Rate', 'range': '10 ≤ breaths per minute ≤ 50', 'value': this.patient.RR, 'time': this.patient.RR_time},
      {'stat': 'Blood Pressure', 'range': 'SBP ≥ 100mmHg', 'value': this.patient.BP, 'time': this.patient.BP_time}
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
}