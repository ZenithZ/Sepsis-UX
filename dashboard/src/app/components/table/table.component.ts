import { Component } from '@angular/core';
import { DataSource } from '@angular/cdk/collections';
import { Observable, of } from 'rxjs';
import { animate, state, style, transition, trigger } from '@angular/animations';
import sampleData from '../../../../mock_data.json'

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0', visibility: 'hidden' })),
      state('expanded', style({ height: '*', visibility: 'visible' })),
      transition('expanded <=> collapsed', animate('250ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class TableComponent {
  displayedColumns = ['MRN', 'Name', 'DOB', 'Gender', 'Vitals', 'LOC', 'Bloodgas', 'Registration'];
  dataSource = new ExampleDataSource();

  isExpansionDetailRow = (i: number, row: Object) => row.hasOwnProperty('detailRow');
  expandedElement: any;
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

/**
 * Data source to provide what data should be rendered in the table. The observable provided
 * in connect should emit exactly the data that should be rendered by the table. If the data is
 * altered, the observable should emit that new set of data on the stream. In our case here,
 * we return a stream that contains only one set of data that doesn't change.
 */
export class ExampleDataSource extends DataSource<any> {
  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<Element[]> {
    const rows = [];
    data.forEach(element => rows.push(element, { detailRow: true, element }));
    console.log(rows);
    return of(rows);
  }

  disconnect() { }
}