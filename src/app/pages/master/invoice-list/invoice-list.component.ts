import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-invoice-list',
  templateUrl: './invoice-list.component.html',
  styleUrls: ['./invoice-list.component.scss']
})
export class InvoiceListComponent implements OnInit {
 
  constructor(private router: Router){}
  ngOnInit(): void {
    
  }
  applyFilter(filterValue: string): void {
   
  }
  addInvoice(){
    this.router.navigate(['/master/addinvoice']);
  }
}
