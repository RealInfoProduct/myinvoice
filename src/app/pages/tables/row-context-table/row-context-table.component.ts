import { Component, OnInit } from '@angular/core';
import { MaterialModule } from '../../../material.module';

@Component({
  selector: 'app-row-context-table',
  standalone: true,
  imports: [MaterialModule],
  templateUrl: './row-context-table.component.html',
})
export class AppRowContextTableComponent implements OnInit {
  displayedColumns: string[] = [
    '$implicit',
    'index',
    'count',
    'first',
    'last',
    'even',
    'odd',
  ];
  data: string[] = ['one', 'two', 'three', 'four', 'five'];

  constructor() {}

  ngOnInit(): void {}
}
