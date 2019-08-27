import { Component, OnInit, Input } from '@angular/core';
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

  formatLabel(value) {
    switch (value) {
      case 3: this.loC = "Unresponsive";
        break;
      case 5: this.loC = "Pain";
        break;
      case 10: this.loC = "Verbal";
        break;
      case 15: this.loC = "Alert";
        break;
      default: this.loC = value + "";
    }
    return this.loC;
  }
}
