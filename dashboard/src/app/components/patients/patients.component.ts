import { Component, OnInit } from '@angular/core';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-patients',
  templateUrl: './patients.component.html',
  styleUrls: ['./patients.component.css']
})
export class PatientsComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  patients = [
    'Patient 1',
    'Patient 2'
  ];

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.patients, event.previousIndex, event.currentIndex);
  }

}
