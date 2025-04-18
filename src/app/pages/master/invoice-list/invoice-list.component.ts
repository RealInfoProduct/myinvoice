import { Component, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource, MatTable } from '@angular/material/table';
import { ProductList } from 'src/app/interface/invoice';
import { FirebaseService } from 'src/app/services/firebase.service';
import { LoaderService } from 'src/app/services/loader.service';
import { productMasterDialogComponent } from '../product-master/product-master.component';
import { DatePipe } from '@angular/common';


@Component({
  selector: 'app-invoice-list',
  templateUrl: './invoice-list.component.html',
  styleUrls: ['./invoice-list.component.scss']
})
export class InvoiceListComponent {
displayedColumns: string[] = [
    'id',
    'customerName',
    'invoiceDate',
    'customerNumber',
    'totalcost',
    'invoiceStatus',
    'action',
  ];
  productList :any = []
  purchaseList :any = []
  purchaseDataSource = new MatTableDataSource(this.purchaseList);
  @ViewChild(MatTable, { static: true }) table: MatTable<any> = Object.create(null);
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator = Object.create(null);

  constructor(private dialog: MatDialog , 
    private firebaseService : FirebaseService ,
    private loaderService : LoaderService,
    private datePipe: DatePipe,
    private _snackBar: MatSnackBar,) { }


  ngOnInit(): void {
    this.getPurchaseList()
    this.getProductList()
  }

  getPurchaseList() {
    this.loaderService.setLoader(true);
  
    this.firebaseService.getAllPurchase().subscribe((res: any) => {
      if (res) {
        // Filter the purchase list based on userId and isShell
        this.purchaseList = res.filter((item: any) => item.userId === localStorage.getItem("userId") && item.isShell);
  
        // Remove duplicates based on invoiceNo and sort them by createDate
        const uniqueInvoices = Object.values(
          this.purchaseList.reduce((acc: any, item: any) => {
            acc[item.invoiceNo] = acc[item.invoiceNo] || item;
            return acc;
          }, {})
        );
  
        // Sort by createDate
        uniqueInvoices.sort((a: any, b: any) => {
          const aTime = a.createDate?.seconds || 0;
          const bTime = b.createDate?.seconds || 0;
          return bTime - aTime;
        });
  
        // Format the invoiceDate for each unique invoice
        uniqueInvoices.forEach((invoice: any) => {
          // Assuming `invoice.createDate` is a Firebase Timestamp object
          const date = new Date(invoice.createDate.seconds * 1000); // Convert seconds to milliseconds
          invoice.invoiceDate = this.datePipe.transform(date, 'fullDate'); // Format the date
        });
  
        // Set the formatted invoices to the data source
        this.purchaseDataSource = new MatTableDataSource(uniqueInvoices);
        this.purchaseDataSource.paginator = this.paginator;
  
        // Hide the loader
        this.loaderService.setLoader(false);
      }
    });
  }
  


  applyFilter(filterValue: string): void {
    this.purchaseDataSource.filter = filterValue.trim().toLowerCase();
  }
  
  getSerialNumber(index: number): number {
    if (!this.paginator) return index + 1;
    return (this.paginator.pageIndex * this.paginator.pageSize) + index + 1;
  }
  
  getProductList() {
    this.loaderService.setLoader(true)
    this.firebaseService.getAllProduct().subscribe((res: any) => {
      if (res) {
        this.productList = res.filter((id:any) => id.userId === localStorage.getItem("userId"))
        this.loaderService.setLoader(false)
      }
    })
  }

  viewInvoice(element: any) {
    const invoiceDetail = {
      id: element.invoiceNo || 'N/A',
      billFrom: element.firmName || 'N/A',
      billFromEmail: 'N/A',
      billFromAddress: element.firmAddress || 'N/A',
      billFromPhone: 'N/A',
      billTo: element.customerName || 'N/A',
      billToEmail: 'N/A',
      billToAddress: 'N/A',
      billToPhone: element.customerNumber || 'N/A',
      orders: [
        {
          itemName: element.productDes || 'Product',
          unitPrice: element.purchaseAmount || 0,
          units: 1, // if you have quantity info, plug it here
          unitTotalPrice: element.finalAmount || 0
        }
      ],
      orderDate: new Date((element.invoiceDate?.seconds || 0) * 1000),
      totalCost: element.purchaseAmount || 0,
      vat: element.finalAmount ? element.finalAmount - element.purchaseAmount : 0,
      grandTotal: element.finalAmount || 0,
      status: element.invoiceStatus || 'Pending',
      completed: element.invoiceStatus === 'Completed',
      isSelected: false
    };
  }
  

productgrandTotal(invoiceNo: number): number {
  const filteredItems = this.purchaseList.filter((item: any) => item.invoiceNo === invoiceNo);
  return filteredItems.reduce((total: number, row: any) => {
    const discountPercent = row.shellDiscount || 0;
    const discountAmount = (discountPercent / 100) * row.shellAmount;
    return total + (row.shellAmount - discountAmount);
  }, 0);
}

}
