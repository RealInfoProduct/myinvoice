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

  showAmountList(obj: any) {
    const dialogRef = this.dialog.open(amountlistdialog, { data: obj, width: '70%' });
  }
  applyFilter(filterValue: string): void {
    this.dataSource.filter = filterValue.trim().toLowerCase();
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

  generatePDFDownload(invoiceData: any){
    switch (invoiceData.firmName.isInvoiceTheme) {
      case 1:
        this.generatePDF1Download(invoiceData)
        break;
    
      default:
        break;
    }
  }

  generatePDF1Download(invoiceData: any) {
    this.loaderService.setLoader(true)

    const doc = new jsPDF();

    // Add image
    const img = new Image();
    img.src = '../assets/hospital11.1.png';
    const logoimg = new Image();
    logoimg.src = '../assets/hospital11.2.png';


    img.onload = () => {

      // Add text on top of the image
      doc.addImage(img, 'JPEG', 0, 0, 220, 50);

      doc.setFontSize(16);
      doc.setTextColor(5, 5, 5);
      doc.text('Invoice:', 161, 18);
      doc.text(String(invoiceData.invoiceNumber), 182, 18);
      doc.setFontSize(16);
      doc.setTextColor(5, 5, 5);
      doc.text('Date:', 161, 27);
      doc.text(invoiceData.date, 175, 27);


      //       // Shop Details

      doc.setFontSize(25);
      doc.setTextColor(255, 255, 255);
      doc.text(invoiceData.firmName.header, 15, 17);
      doc.setFontSize(10);
      doc.setTextColor(5, 5, 5);
      const addresseLines = doc.splitTextToSize(invoiceData.firmName.address, 60);
      let startYFirm = 60;
      addresseLines.forEach((line: string) => {
        doc.text(line, 15, startYFirm);
        startYFirm += 5;
      });
      doc.text('Mob No:', 15, 70);
      doc.text(String(invoiceData.firmName.mobileNo), 30, 70);
      doc.setFontSize(13);
      doc.setTextColor(0, 0, 0);
      doc.text('GST:', 14, 90);
      doc.text(invoiceData.firmName.gstNo, 28, 90);


      //  //  Customer Details
      doc.setFontSize(15);
      doc.setTextColor(122, 122, 122);
      doc.text('Customer Details', 130, 45);
      doc.setFontSize(12);
      doc.setTextColor(5, 5, 5);
      doc.text(invoiceData.partyName.partyName, 130, 55);
      doc.setFontSize(10);
      const addressLines = doc.splitTextToSize(invoiceData.partyName.partyAddress, 60);
      let startYCustomer = 60;
      addressLines.forEach((line: string) => {
        doc.text(line, 130, startYCustomer);
        startYCustomer += 5;
      });
      doc.text('Mob No :', 130, 70);
      doc.text(String(invoiceData.partyName.partyMobileNo), 147, 70);
      doc.setFontSize(13);
      doc.setTextColor(0, 0, 0);
      doc.text('GST :', 138, 90);
      doc.text(invoiceData.partyName.partyGstNo, 152, 90);

      const productsSubTotal = invoiceData.products.reduce((acc: any, product: any) => acc + product.finalAmount, 0);

      const bodyRows = invoiceData.products.map((product: any, index: any) => [
        index + 1,
        product.poNumber,
        product.productName.productName,
        product.qty,
        product.defectiveItem,
        product.price,
        product.finalAmount,
      ]);

      // Add empty rows if there are less than 17 products
      while (bodyRows.length < 10) {
        bodyRows.push([
          '',
          '',
          '',
          '',
          '',
          '',
          '',
        ]);
      }
      (doc as any).autoTable({
        head: [['Sr.','Po Number' , 'product', 'Qty', 'Defective Item', 'Price', 'Final Amount']],
        body: bodyRows,
        startY: 95,
        theme: 'plain',
        headStyles: {
          fillColor: [0, 62, 95],
          textColor: [255, 255, 255],
          fontSize: 10,
          cellPadding: 2,
        },
        bodyStyles: {
          textColor: [0, 0, 0],
          halign: 'left',
          fontSize: 15,
        },
        didDrawCell: (data: any) => {
          const { cell, row, column } = data;
          if (row.section === 'body') {
            doc.setDrawColor(122, 122, 122);
            doc.setLineWidth(0.2);
            doc.line(cell.x, cell.y + cell.height, cell.x + cell.width, cell.y + cell.height);
          }

        }

      });



      doc.addImage(logoimg, 'JPEG', 0, 272, 210, 25);

      doc.setFontSize(12);
      doc.setTextColor(33, 52, 66);
      doc.text('Total : ', 165, 240);
      doc.text(String("rs" + productsSubTotal), 180, 240);
      doc.text('Discount % :', 154, 246);
      doc.text(String(invoiceData.discount), 183, 246);
      doc.text('SGST % :', 159, 252);
      doc.text(String(invoiceData.sGST), 183, 252);
      doc.text('CGST % :', 159, 258);
      doc.text(String(invoiceData.cGST), 183, 258);
      doc.setFillColor(245, 245, 245);
      doc.rect(142, 261, 90, 10, 'F');
      doc.setTextColor(0, 0, 0);
      doc.text("Final Amount : ", 150, 268);
      doc.text(String("rs" + invoiceData.finalSubAmount), 180, 268);

      // PAN NO
      doc.setFontSize(12);
      doc.setTextColor(33, 52, 66);
      doc.text('PAN NO :', 16, 240);
      doc.text(invoiceData.firmName.panNo, 35, 240);


      // open PDF
      window.open(doc.output('bloburl'))
    this.loaderService.setLoader(false)

    }
  }
}



@Component({
  selector: 'app-productdialog',
  templateUrl: 'productdialog.html',
  styleUrls: ['./invoice-list.component.scss']
})

export class productdialog  implements OnInit {
  displayedColumns: string[] = ['productName' , 'price', 'qty' , 'defectiveItem', 'poNumber', 'finalAmount' ];
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

@Component({
  selector: 'app-showAmountList',
  templateUrl: 'amountlistdialog.html',
  styleUrls: ['./invoice-list.component.scss']
})

export class amountlistdialog  implements OnInit {
  displayedColumns: string[] = ['Payment Date' , 'Payment Amount'];
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
      }
    })
  }
}