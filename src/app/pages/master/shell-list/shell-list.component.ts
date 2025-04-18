import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { FirebaseService } from 'src/app/services/firebase.service';
import { LoaderService } from 'src/app/services/loader.service';

@Component({
  selector: 'app-shell-list',
  templateUrl: './shell-list.component.html',
  styleUrls: ['./shell-list.component.scss']
})
export class ShellListComponent implements OnInit {
  dateInvoiceListForm: FormGroup;
  displayedColumns: string[] = [
    'srno',
    'ProductName',
    'customerName',
    'customerNumber',
    'shellAmount',
  ];
  purchaseList: any = []
  productList: any = []

  purchaseDataSource = new MatTableDataSource(this.purchaseList);
  @ViewChild(MatTable, { static: true }) table: MatTable<any> = Object.create(null);
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator = Object.create(null);

  constructor(private firebaseService: FirebaseService,
    private fb: FormBuilder,
    private loaderService: LoaderService,) { }


  ngOnInit(): void {
    this.getPurchaseList()
    this.getProductList()
    const today = new Date();
    const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
    const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    this.dateInvoiceListForm = this.fb.group({
      start: [startDate],
      end: [endDate]
    });
  }

  filterDate() {
    if (!this.purchaseList) return;
    const startDate = this.dateInvoiceListForm.value.start ? new Date(this.dateInvoiceListForm.value.start) : null;
    const endDate = this.dateInvoiceListForm.value.end ? new Date(this.dateInvoiceListForm.value.end) : null;
  
    if (startDate && endDate) {
      this.purchaseDataSource.data = this.purchaseList.filter((invoice: any) => {
        if (!invoice.productDate) return false;
  
        let invoiceDate;
        if (invoice.productDate.toDate) {
          invoiceDate = invoice.productDate.toDate();
        } else if (invoice.productDate instanceof Date) {
          invoiceDate = invoice.productDate;
        } else {
          return false;
        }
  
        return invoiceDate >= startDate && invoiceDate <= endDate;
      });
    } else {
      this.purchaseDataSource.data = this.purchaseList;
    }
  }
  
  applyFilter(filterValue: string): void {
    this.purchaseDataSource.filter = filterValue.trim().toLowerCase();
  }

  getPurchaseList() {
    this.loaderService.setLoader(true);
    this.firebaseService.getAllPurchase().subscribe((res: any) => {
      if (res) {
        this.purchaseList = res.filter((item: any) => item.userId === localStorage.getItem("userId") && item.isShell);
        this.purchaseList.sort((a: any, b: any) => {
          const aTime = a.createDate?.seconds || 0;
          const bTime = b.createDate?.seconds || 0;
          return bTime - aTime;
        });
        this.filterDate();
        this.purchaseDataSource = new MatTableDataSource(this.purchaseList);
        this.purchaseDataSource.paginator = this.paginator;
        this.loaderService.setLoader(false);
        console.log('purchaseList===>>' , this.purchaseList);
        
      }
    });
  }

  getProductList() {
    this.loaderService.setLoader(true)
    this.firebaseService.getAllProduct().subscribe((res: any) => {
      if (res) {
        this.productList = res.filter((id: any) => id.userId === localStorage.getItem("userId"))
        this.loaderService.setLoader(false)
      }
    })
  }

  getProductName(productid: string) {
    return this.productList.find((id: any) => id.id === productid)?.productName
  }

}
