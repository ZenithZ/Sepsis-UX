import { Component, OnInit, Input, Output } from '@angular/core';
import { Patient } from '../table/table.component';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.css']
})
export class DetailComponent implements OnInit {

  @Input() patient: Patient;

  val:number = 15;
  selected:string = "Yes";
  loC: string = "Alert";

  constructor() { }

  ngOnInit() {
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
