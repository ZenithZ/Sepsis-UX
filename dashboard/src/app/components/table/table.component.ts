import { Component } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import {MatTableDataSource} from '@angular/material/table';
import sampleData from '../../../../mock_data.json'

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0', visibility: 'hidden' })),
      state('expanded', style({ height: '*', visibility: 'visible' })),
      transition('expanded <=> collapsed', animate('125ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class TableComponent {
  displayedColumns: string[] = ['MRN', 'Name', 'DOB', 'Gender', 'Vitals', 'LOC', 'BG', 'Reg'];
  dataSource = new MatTableDataSource(data);
  expandedElement: Patient | null ;

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
}

export interface Patient {
  MRN: number;
  FirstName: string;
  LastName: string;
  DOB: string;
  Gender: string;
  BT: number;
  PR: number;
  RR: number;
  BP: number;
  LOC: number;
  BT_time: string;
  PR_time: string;
  RR_time: string;
  BP_time: string;
  LOC_time: string;
  Registration: string;
  BG: boolean;
  BG_time: string;
  BG_pH: number;
  Pa_CO2: number;
  HCO3: number;
  PaO2: number;
}

const data: Patient[] = sampleData.slice(1,50); 