import { Component, OnInit } from '@angular/core';
import { MaterialModule } from '../../../material.module';
import { CommonModule } from '@angular/common';
export interface Transaction {
  item: string;
  img: string;
  cost: number;
}
@Component({
  selector: 'app-footer-row-table',
  standalone: true,
  imports: [MaterialModule, CommonModule],
  templateUrl: './footer-row-table.component.html',
  styleUrls: ['./footer-row-table.component.scss'],
})
export class AppFooterRowTableComponent implements OnInit {
  displayedColumns: string[] = ['item', 'cost'];
  transactions: Transaction[] = [
    { img: '/assets/images/products/s1.jpg', item: 'Beach ball', cost: 4 },
    { img: '/assets/images/products/s2.jpg', item: 'Towel', cost: 5 },
    { img: '/assets/images/products/s3.jpg', item: 'Frisbee', cost: 2 },
    { img: '/assets/images/products/s4.jpg', item: 'Sunscreen', cost: 4 },
    { img: '/assets/images/products/s5.jpg', item: 'Cooler', cost: 25 },
    { img: '/assets/images/products/s6.jpg', item: 'Swim suit', cost: 15 },
  ];

  /** Gets the total cost of all transactions. */
  getTotalCost() {
    return this.transactions
      .map((t) => t.cost)
      .reduce((acc, value) => acc + value, 0);
  }

  constructor() {}

  ngOnInit(): void {}
}
