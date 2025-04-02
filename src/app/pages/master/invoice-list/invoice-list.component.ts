import { Component, Inject, OnInit, Optional, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router, RouterLink } from '@angular/router';
import { FirebaseService } from 'src/app/services/firebase.service';
import { LoaderService } from 'src/app/services/loader.service';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import moment from 'moment';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PdfgenService } from '../pdfgen.service';

@Component({
  selector: 'app-invoice-list',
  templateUrl: './invoice-list.component.html',
  styleUrls: ['./invoice-list.component.scss']
})
export class InvoiceListComponent implements OnInit {
  dateInvoiceListForm: FormGroup;
  invoiceList: any = []
  firmList: any = []
  partyList: any = []
  displayedColumns: string[] = [
    'srno',
    'firmName',
    // 'partyName',
    'invoiceNo',
    'CGST',
    'SGST',
    'discount',
    'finalSubAmount',
    'action',
  ];
  dataSource: any
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator = Object.create(null);

  constructor(private router: Router,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private firebaseService: FirebaseService,
    private loaderService: LoaderService,
    private pdfgenService:PdfgenService
  ) { }

  ngOnInit(): void {
    const today = new Date();
    const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
    const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    this.dateInvoiceListForm = this.fb.group({
      start: [startDate],
      end: [endDate]
    });
    this.getInvoiceList()
    this.getFirmList()
    this.getPartyList()
  }

  filterDate() {
    if (!this.invoiceList) return;
    const startDate = this.dateInvoiceListForm.value.start ? new Date(this.dateInvoiceListForm.value.start) : null;
    const endDate = this.dateInvoiceListForm.value.end ? new Date(this.dateInvoiceListForm.value.end) : null;
    if (startDate && endDate) {
      this.dataSource.data = this.invoiceList.filter((invoice: any) => {
        if (!invoice.date) return false;
        let invoiceDate;
        if (typeof invoice.date === 'string') {
          const dateParts = invoice.date.split('/');
          invoiceDate = new Date(`${dateParts[2]}-${dateParts[0]}-${dateParts[1]}`);
        } else {
          return false; 
        }
        return invoiceDate >= startDate && invoiceDate <= endDate;
      });
    } else {
      this.dataSource.data = this.invoiceList;
    }
  }

  calculateTotalReceivedPayment(receivePayment: any[]): number {
    if (!receivePayment) return 0;
    return receivePayment.reduce((total, payment) => total + payment.paymentAmount, 0);
  }

  addProduct(obj: any) {
    const dialogRef = this.dialog.open(productdialog, { data: obj });
  }

  showAmountList(obj: any) {
    const dialogRef = this.dialog.open(amountlistdialog, { data: obj });
  }

  applyFilter(filterValue: string): void {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  addInvoice() {
    this.router.navigate(['/master/addinvoice']);
  }

  getInvoiceList() {
    this.loaderService.setLoader(true)
    this.firebaseService.getAllInvoice().subscribe((res: any) => {
      if (res) {
        this.invoiceList = res.filter((id: any) =>
          id.userId === localStorage.getItem("userId") &&
          id.accountYear === localStorage.getItem("accountYear")
        )
        
        this.dataSource = new MatTableDataSource(this.invoiceList);
        this.dataSource.paginator = this.paginator;
        this.loaderService.setLoader(false)
      }
    })
  }

  generatePDFDownload(invoiceData: any) {

    const partyData = this.getPartyName(invoiceData.partyId)
    const firmData = this.getFirmHeader(invoiceData.firmId)
    invoiceData['firmName'] = firmData
    invoiceData['partyName'] = partyData
    switch (invoiceData?.firmName?.isInvoiceTheme) {
      case 1:
        this.pdfgenService.generatePDF1Download(invoiceData)
        break;
        case 2:
          // this.pdfgenService.generatePDF2Download(invoiceData)
          break;
        case 3:
          // this.pdfgenService.generatePDF3Download(invoiceData)
          break;
        case 4:
          // this.pdfgenService.generatePDF4Download(invoiceData)
          break;
        case 5:
          // this.pdfgenService.generatePDF5Download(invoiceData)
          break;
    
      default:
        break;
    }
  }

  getFirmList() {
    this.loaderService.setLoader(true)
    this.firebaseService.getAllFirm().subscribe((res: any) => {
      if (res) {
        this.firmList = res.filter((id: any) => id.userId === localStorage.getItem("userId"))
        this.loaderService.setLoader(false)
      }
    })
  }

  getPartyList() {
    this.loaderService.setLoader(true)
    this.firebaseService.getAllParty().subscribe((res: any) => {
      if (res) {
        this.partyList = res.filter((id: any) => id.userId === localStorage.getItem("userId"))
        this.loaderService.setLoader(false)
      }
    })
  }

  getPartyName(partyId:string) {
    return this.partyList.find((obj: any) => obj.id === partyId) ?? ''
  }

  getFirmHeader(firmId: string) {
    return this.firmList.find((obj: any) => obj.id === firmId) ?? ''
  }

}



@Component({
  selector: 'app-productdialog',
  templateUrl: 'productdialog.html',
  styleUrls: ['./invoice-list.component.scss']
})

export class productdialog implements OnInit {
  displayedColumns: string[] = ['productName', 'price', 'qty', 'defectiveItem', 'poNumber', 'finalAmount'];
  dataSource: any = []
  constructor(
    public dialogRef: MatDialogRef<productdialog>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any
  ) {

    data.forEach((element: any) => {
      this.dataSource.push(element)
    });

  }
  ngOnInit(): void {

  }
}

@Component({
  selector: 'app-showAmountList',
  templateUrl: 'amountlistdialog.html',
  styleUrls: ['./invoice-list.component.scss']
})

export class amountlistdialog  implements OnInit {
  displayedColumns: string[] = ['srNo', 'productPrice','totalAmount'];
  dataSource :any = [] 
  amountForm: FormGroup
  constructor(
    public dialogRef: MatDialogRef<amountlistdialog>,
    @Optional() @Inject(MAT_DIALOG_DATA) public amountdata: any,
    private fb: FormBuilder,
    private firebaseService : FirebaseService,
    private _snackBar: MatSnackBar,
    private loaderService: LoaderService,
  ) {
    this.dataSource = amountdata.receivePayment
    amountdata['pendingAmount'] = (amountdata.finalSubAmount) - (amountdata.receivePayment.reduce((total:any, payment :any) => total + payment.paymentAmount, 0))
  }
  ngOnInit(): void {
    this.buildForm()
    
  }

  buildForm() {
    this.amountForm = this.fb.group({
      paymentDate: [new Date(), Validators.required],
      paymentAmount: [0, Validators.required],
    })
  }

  addPayment() {
    const paymentData = {
      paymentDate: moment(this.amountForm.value.paymentDate).format('L'),
      paymentAmount: this.amountForm.value.paymentAmount,
    }
    this.amountdata.receivePayment.push(paymentData)
    const pendingTotalAmount = (this.amountdata.finalSubAmount) - (this.amountdata.receivePayment.reduce((total: any, payment: any) => total + payment.paymentAmount, 0))

    if (pendingTotalAmount === 0) {
      this.amountdata.isPayment = true
    }

    if (pendingTotalAmount >= 0) {
       this.loaderService.setLoader(false)
    this.firebaseService.updateInvoice(this.amountdata.id, this.amountdata).then((res: any) => {
      this.openConfigSnackBar('payment received successfully')
      this.getInvoiceList()
      this.amountForm.controls['paymentAmount'].reset()
      this.amountdata.receivePayment = []

    }, (error) => {
      this.openConfigSnackBar(error.error.error.message)
      this.loaderService.setLoader(false)
      this.amountdata.receivePayment = []

    })
    
  } else {
      this.openConfigSnackBar('payments not available')
      this.getInvoiceList()
      this.amountdata.receivePayment = []

    }
  }

  openConfigSnackBar(snackbarTitle: any) {
    this._snackBar.open(snackbarTitle, 'Splash', {
      duration: 2 * 1000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }
  
  getInvoiceList() {
    this.loaderService.setLoader(true)
    this.firebaseService.getAllInvoice().subscribe((res: any) => {
      if (res) {
        this.amountdata = res.find((id:any) => 
          id.id === this.amountdata.id
         )              

         this.dataSource = this.amountdata.receivePayment
         this.amountdata['pendingAmount'] = (this.amountdata.finalSubAmount) - (this.amountdata.receivePayment.reduce((total:any, payment :any) => total + payment.paymentAmount, 0))
         this.loaderService.setLoader(false)
        console.log("{[res]}", res);
         console.log("{[this.amountdata]}", this.amountdata);
        }
    })
  }
}