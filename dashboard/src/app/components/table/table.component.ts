import { Component, ViewChild, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
<<<<<<< HEAD
import { SelectionModel } from '@angular/cdk/collections';
=======
>>>>>>> dcf57011956bfef477fe51998f8e88ea6f4eb08c

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
export class TableComponent implements OnChanges {

  @Input() title: string;
  @Input() patients: any[];
  @Input() filter: string;

  currentTime: number;
  myInterval;
  displayedColumns: string[] = ['Seen', 'MRN', 'Name', 'DOB', 'LOC', 'Vitals', 'BG', 'Registration', 'Delta'];
  expandedElement: any | null;
  atsNo: number;
  dataSource: MatTableDataSource<any>;
<<<<<<< HEAD
  selection = new SelectionModel<any>(true, []);
=======
>>>>>>> dcf57011956bfef477fe51998f8e88ea6f4eb08c

  @ViewChild(MatSort, { static: true }) sort: MatSort;

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
    console.log(this.dataSource)
  }

  ngOnInit() {
    this.atsNo = parseInt(this.title.split(" ")[1])
    this.dataSource = new MatTableDataSource(this.patients);
    this.dataSource.sort = this.sort;
    this.filter = ""
    this.getTime()
    this.myInterval = setInterval(() => {
      this.getTime()
    }, 1000)
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.filter.currentValue !== undefined) {
      this.applyFilter(changes.filter.currentValue)
    }
  }
<<<<<<< HEAD

  removeSelectedRows() {
    this.selection.selected.forEach(item => {
      var index = this.dataSource.data.indexOf(item);
      this.dataSource.data.splice(index,1);
      this.dataSource = new MatTableDataSource<any>(this.dataSource.data);
    });
    this.selection = new SelectionModel<any>(true, []);
  }

  getTime() {
    this.currentTime = Date.now();
  }

=======

  getTime() {
    this.currentTime = Date.now();
  }

>>>>>>> dcf57011956bfef477fe51998f8e88ea6f4eb08c
}
