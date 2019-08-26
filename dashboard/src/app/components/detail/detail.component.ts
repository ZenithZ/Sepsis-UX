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

  constructor() { }

  ngOnInit() {
  }

  formatLabel(value) {
    return value;
  }
}
