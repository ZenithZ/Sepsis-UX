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

  displayedColumns: string[] = ['Stat', 'Lower', 'Value', 'Upper', 'Time'];
  data: string[] = ['BT', 'PR', 'RR', 'BP'];
  dataSource;

  val:number = 3;
  selected:string = "Yes";
  loC: string = "Unresponsive";

  constructor() { }

  ngOnInit() {
    let patientDataArray = [
      {'stat': 'Body Temperature', 'lower': 35.5,'upper':38.5, 'value': this.patient.BT, 'time': this.patient.BT_time},
      {'stat': 'Heart Rate', 'lower': 50, 'upper':120, 'value': this.patient.PR, 'time': this.patient.PR_time},
      {'stat': 'Respiration Rate', 'lower': 10,'upper':50, 'value': this.patient.RR, 'time': this.patient.RR_time},
      {'stat': 'Blood Pressure', 'lower': 100, 'upper': 120, 'value': this.patient.BP, 'time': this.patient.BP_time}
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