import { Component, Inject, OnInit, Optional, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router, RouterLink } from '@angular/router';
import { FirebaseService } from 'src/app/services/firebase.service';
import { LoaderService } from 'src/app/services/loader.service';

@Component({
  selector: 'app-invoice-list',
  templateUrl: './invoice-list.component.html',
  styleUrls: ['./invoice-list.component.scss']
})
export class InvoiceListComponent implements OnInit {
 
  invoiceList :any = []
  displayedColumns: string[] = [
    'srno',
    'firmName',
    'partyName',
    'invoiceNo',
    'CGST',
    'SGST',
    'discount',
    'action',
  ];
  dataSource: any
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator = Object.create(null);
  constructor(private router: Router,
    private dialog: MatDialog ,
    private firebaseService: FirebaseService,
    private loaderService: LoaderService,
  ){}
  ngOnInit(): void {
    this.getInvoiceList()
    
  }

  addProduct(obj: any) {
    const dialogRef = this.dialog.open(productdialog, { data: obj, width: '70%' });
  }
  applyFilter(filterValue: string): void {
   
  }
  addInvoice(){
    this.router.navigate(['/master/addinvoice']);
  }

  getInvoiceList() {
    this.loaderService.setLoader(true)
    this.firebaseService.getAllInvoice().subscribe((res: any) => {
      if (res) {
        this.invoiceList = res.filter((id:any) => 
          id.userId === localStorage.getItem("userId") && 
          id.accountYear === localStorage.getItem("accountYear")
         )     
         this.dataSource = new MatTableDataSource(this.invoiceList);
        this.dataSource.paginator = this.paginator;
        this.loaderService.setLoader(false)
      }
    })
  }
}



@Component({
  selector: 'app-productdialog',
  templateUrl: 'productdialog.html',
  styleUrls: ['./invoice-list.component.scss']
})

export class productdialog  implements OnInit {
  displayedColumns: string[] = ['defectiveItem', 'finalAmount', 'productName', 'poNumber', 'price', 'qty'];
  dataSource :any = [] 
  constructor(
    public dialogRef: MatDialogRef<productdialog>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any
  ) {

    data.forEach((element :any) => {
      this.dataSource.push(element)
    });
    
  }
  ngOnInit(): void {
    
  }
}