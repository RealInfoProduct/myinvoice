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

  invoiceList: any = []
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
    private dialog: MatDialog,
    private firebaseService: FirebaseService,
    private loaderService: LoaderService,
  ) { }
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

  generatePDFDownload(invoiceData: any){
    switch (invoiceData.firmName.isInvoiceTheme) {
      case 1:
        this.generatePDF1Download(invoiceData)
        break;
        case 2:
          this.generatePDF2Download(invoiceData)
          break;
        case 3:
          this.generatePDF3Download(invoiceData)
          break;
        case 4:
          this.generatePDF4Download(invoiceData)
          break;
        case 5:
          this.generatePDF5Download(invoiceData)
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
      const productsQty = invoiceData.products.reduce((acc: any, product: any) => acc + product.qty, 0);
      const productsdefectiveItem= invoiceData.products.reduce((acc: any, product: any) => acc + product.defectiveItem, 0);

      const bodyRows = invoiceData.products.map((product: any, index: any) => [
        index + 1,
        product.poNumber,
        product.productName.productName,
        product.qty,
        product.defectiveItem,
        product.price,
        product.finalAmount,
      ]);

      // Add empty rows if there are less than 10 products
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
        head: [['Sr.','Po Number' , ' Product', 'Qty', 'Defective Item', 'Price', 'Final Amount']],
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
      const discountAmount = (productsSubTotal * (invoiceData.discount / 100));
      const discountedSubTotal = productsSubTotal - discountAmount;
      const sGstAmount = discountedSubTotal * (invoiceData.sGST / 100);
      const cGstAmount = discountedSubTotal * (invoiceData.cGST / 100);
      const finalAmount = discountedSubTotal + sGstAmount + cGstAmount;

      doc.setFontSize(12);
      doc.setTextColor(33, 52, 66);
      doc.setLineWidth(0.2);
      doc.line(89, 209, 196, 209);
      doc.line(89, 218, 196, 218);
      doc.line(89, 227, 196, 227);
      doc.line(89, 236, 196, 236);
      doc.text(String(productsQty), 90, 207);
      doc.text(String(productsdefectiveItem), 103, 207);
      doc.text(String(productsQty), 90, 210);
    // doc.text('Total : ', 165, 240);
    doc.text(String("Rs"+' ' + productsSubTotal), 160, 207);
    doc.text('Disc % :', 124, 215);
    doc.text(String(invoiceData.discount  + "%"), 145, 215);
    doc.text(String("Rs"+' ' + discountAmount), 160, 215);
    doc.text('S.GST % :', 120, 224);
    doc.text(String(invoiceData.sGST  + "%"), 145, 224);
    doc.text(String("Rs"+' ' + sGstAmount.toFixed(2)), 160, 224);
    doc.text('C.GST % :', 120, 234);
    doc.text(String(invoiceData.cGST  + "%"), 145, 234);
    doc.text(String("Rs"+' ' + cGstAmount.toFixed(2)), 160, 234);
    doc.setFillColor(245, 245, 245);
    doc.rect(117, 238, 100, 10, 'F');
    doc.setTextColor(0, 0, 0);
    doc.text("Final Amount : ", 120, 244);
    // doc.text(String(invoiceData.finalSubAmount)+ "Rs", 160, 244);
        doc.text(String("Rs"+' ' + finalAmount.toFixed(2)) , 160, 244);

      // PAN NO
      doc.setFontSize(12);
      doc.setTextColor(33, 52, 66);
      doc.text('PAN NO :', 16, 215);
      doc.text(invoiceData.firmName.panNo, 35, 215);

      // open PDF
      window.open(doc.output('bloburl'))
    this.loaderService.setLoader(false)

    }
  }

  generatePDF2Download(invoiceData: any){
    console.log("invoiceData==>", invoiceData);

    const doc = new jsPDF();

    // Add image
    const img = new Image();
    img.src = '../assets/header.png';
    const logoimg = new Image();
    logoimg.src = '../assets/footer.png';

    img.onload = () => {
      doc.addImage(img, 'JPEG', 0, 0, 211, 60);
      // Add text on top of the image



      doc.setFontSize(11);
      doc.setTextColor(122, 122, 122);
      doc.text('Invoice :', 130, 55);
      doc.text(String(invoiceData.invoiceNumber), 145, 55);
      doc.setFontSize(11);
      doc.setTextColor(5, 5, 5);
      doc.text('Date :', 165, 55);
      doc.text(invoiceData.date, 177, 55);

      // Shop Details
      doc.setFontSize(25);
      doc.setTextColor(5, 5, 5);
      doc.text(invoiceData.firmName.header, 110, 30);
      doc.setFontSize(10);
      doc.setTextColor(5, 5, 5);
      const addresseLines = doc.splitTextToSize(invoiceData.firmName.address, 60);
      let startYFirm = 85;
      addresseLines.forEach((line: string) => {
        doc.text(line, 14, startYFirm);
        startYFirm += 5;
      });
      doc.text('Mob No:', 14, 95);
      doc.text(String(invoiceData.firmName.mobileNo), 29, 95);
      doc.setFontSize(13);
      doc.setTextColor(0, 0, 0);
      doc.text('GST:', 14, 110);
      doc.text(invoiceData.firmName.gstNo, 28, 110);

      //  Customer Details
      doc.setFontSize(15);
      doc.setTextColor(122, 122, 122);
      doc.text('Customer Details', 127, 70);
      doc.setFontSize(12);
      doc.setTextColor(5, 5, 5);
      doc.text(invoiceData.partyName.partyName, 127, 80);
      doc.setFontSize(10);
      doc.setTextColor(5, 5, 5);
      const addressLines = doc.splitTextToSize(invoiceData.partyName.partyAddress, 60);
      let startYCustomer = 85;
      addressLines.forEach((line: string) => {
        doc.text(line, 127, startYCustomer);
        startYCustomer += 5;
      });
      doc.text('Mob No:', 127, 95);
      doc.text(String(invoiceData.partyName.partyMobileNo), 142, 95);
      doc.setFontSize(13);
      doc.setTextColor(0, 0, 0);
      doc.text('GST:', 140, 110);
      doc.text(invoiceData.partyName.partyGstNo, 153, 110);


      const productsSubTotal = invoiceData.products.reduce((acc: any, product: any) => acc + product.finalAmount, 0);
      const productsQty = invoiceData.products.reduce((acc: any, product: any) => acc + product.qty, 0);
      const productsdefectiveItem= invoiceData.products.reduce((acc: any, product: any) => acc + product.defectiveItem, 0);

      const bodyRows = invoiceData.products.map((product: any, index: any) => [
        index + 1,
        product.poNumber,
        product.productName.productName,
        product.qty,
        product.defectiveItem,
        product.price,
        product.finalAmount,
      ]);

      // Add empty rows if there are less than 10 products
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
        head: [['Sr.', 'Po Number', 'Product', 'Qty', 'Defective Item', 'Price', 'Final Amount']],
        body: bodyRows,
        startY: 115,
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


      const discountAmount = (productsSubTotal * (invoiceData.discount  / 100));
      const discountedSubTotal = productsSubTotal - discountAmount;
      const sGstAmount = discountedSubTotal * (invoiceData.sGST / 100);
      const cGstAmount = discountedSubTotal * (invoiceData.cGST / 100);
      const finalAmount = discountedSubTotal + sGstAmount + cGstAmount;


      doc.setFontSize(12);
      doc.setTextColor(33, 52, 66);
      doc.setLineWidth(0.2);
      doc.line(89, 228, 196, 228);
      doc.line(89, 237, 196, 237);
      doc.line(89, 246, 196, 246);
      doc.line(89, 255, 196, 255);
      doc.text(String(productsQty), 90, 225);
      doc.text(String(productsdefectiveItem), 103, 225);
      // doc.text('Total : ', 165, 240);
      doc.text(String("Rs"+' ' + productsSubTotal), 160, 225);
      doc.text('Disc % :', 124, 234);
      doc.text(String(invoiceData.discount  + "%"), 145, 234);
      doc.text(String("Rs"+' ' + discountAmount) , 160, 234);
      doc.text('S.GST % :', 120, 243);
      doc.text(String(invoiceData.sGST  + "%"), 145, 243);
      doc.text(String("Rs"+' ' + sGstAmount.toFixed(2)) , 160, 243);
      doc.text('C.GST % :', 120, 252);
      doc.text(String(invoiceData.cGST  + "%"), 145, 252);
      doc.text(String("Rs"+' ' + cGstAmount.toFixed(2)) , 160, 252);
      doc.setFillColor(245, 245, 245);
      doc.rect(117, 256, 100, 10, 'F');
      doc.setTextColor(0, 0, 0);
      doc.text("Final Amount : ", 120, 262);
      // doc.text(String(invoiceData.finalSubAmount)+ "Rs", 160, 262);
      doc.text(String("Rs"+' ' + finalAmount.toFixed(2)) , 160, 262);

      

      doc.addImage(logoimg, 'JPEG', 0, 267, 211, 30);

      // PAN NO
      doc.setFontSize(12);
      doc.setTextColor(33, 52, 66);
      doc.text('PAN NO :', 16, 234);
      doc.text(invoiceData.firmName.panNo, 35, 234);

      // open PDF
      window.open(doc.output('bloburl'))



    };

  }

  generatePDF3Download(invoiceData: any){
    const doc = new jsPDF();

    const img = new Image();
    img.src = '../assets/Group1.png';
    const logoimg = new Image();
    logoimg.src = '../assets/Group(2).png';

    img.onload = () => {
      doc.addImage(img, 'JPEG', 0, 10, 211, 30);
      // Add text on top of the image



      //date and invoice no
      doc.setFontSize(15);
      doc.setTextColor(255, 255, 255);
      doc.text('Invoice :', 20, 25);
      doc.text(String(invoiceData.invoiceNumber), 42, 25);
      doc.setFontSize(15);
      doc.setTextColor(255, 255, 255);
      doc.text('Date :', 25, 33);
      doc.text(invoiceData.date, 42, 33);



      // Shop Details
      doc.setFontSize(25);
      doc.setTextColor(255, 255, 255);
      doc.text(invoiceData.firmName.header, 120, 28);
      doc.setFontSize(10);
      doc.setTextColor(5, 5, 5);
      const addresseLines = doc.splitTextToSize(invoiceData.firmName.address, 60);
      let startYFirm = 70;
      addresseLines.forEach((line: string) => {
        doc.text(line, 14, startYFirm);
        startYFirm += 5;
      });
      doc.text('Mob No:', 14, 80);
      doc.text(String(invoiceData.firmName.mobileNo), 29, 80);
      doc.setFontSize(13);
      doc.setTextColor(0, 0, 0);
      doc.text('GST:', 14, 100);
      doc.text(invoiceData.firmName.gstNo, 28, 100);

      //  Customer Details
      doc.setFontSize(15);
      doc.setTextColor(122, 122, 122);
      doc.text('Customer Details', 127, 58);
      doc.setFontSize(12);
      doc.setTextColor(5, 5, 5);
      doc.text(invoiceData.partyName.partyName, 127, 65);
      doc.setFontSize(10);
      doc.setTextColor(5, 5, 5);
      const addressLines = doc.splitTextToSize(invoiceData.partyName.partyAddress, 60);
      let startYCustomer = 70;
      addressLines.forEach((line: string) => {
        doc.text(line, 127, startYCustomer);
        startYCustomer += 5;
      });
      doc.text('Mob No:', 127, 80);
      doc.text(String(invoiceData.partyName.partyMobileNo), 142, 80);
      doc.setFontSize(13);
      doc.setTextColor(0, 0, 0);
      doc.text('GST:', 140, 100);
      doc.text(invoiceData.partyName.partyGstNo, 153, 100);



      // Add table
      const productsSubTotal = invoiceData.products.reduce((acc: any, product: any) => acc + product.finalAmount, 0);
      const productsQty = invoiceData.products.reduce((acc: any, product: any) => acc + product.qty, 0);
      const productsdefectiveItem= invoiceData.products.reduce((acc: any, product: any) => acc + product.defectiveItem, 0);

      const bodyRows = invoiceData.products.map((product: any, index: any) => [
        index + 1,
        product.poNumber,
        product.productName.productName,
        product.qty,
        product.defectiveItem,
        product.price,
        product.finalAmount,
      ]);

      // Add empty rows if there are less than 10 products
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
        head: [['Sr.', 'Po Number', 'Product', 'Qty', 'Defective Item', 'Price', 'Final Amount']],
        body: bodyRows,
        startY: 105,
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
      const discountAmount = (productsSubTotal * (invoiceData.discount / 100));
      const discountedSubTotal = productsSubTotal - discountAmount;
      const sGstAmount = discountedSubTotal * (invoiceData.sGST / 100);
      const cGstAmount = discountedSubTotal * (invoiceData.cGST / 100);
      const finalAmount = discountedSubTotal + sGstAmount + cGstAmount;

      doc.setFontSize(12);
      doc.setTextColor(33, 52, 66);
      doc.setLineWidth(0.2);
      doc.line(89, 219, 196, 219);
      doc.line(89, 228, 196, 228);
      doc.line(89, 237, 196, 237);
      doc.line(89, 246, 196, 246);
      doc.text(String(productsQty), 90, 216);
      doc.text(String(productsdefectiveItem), 103, 216);
      // doc.text('Total : ', 165, 240);
      doc.text(String("Rs"+' ' + productsSubTotal), 160, 216);
      doc.text('Disc % :', 124, 225);
      doc.text(String(invoiceData.discount  + "%"), 145, 225);
      doc.text(String("Rs"+' ' + discountAmount) , 160, 225);
      doc.text('S.GST % :', 120, 234);
      doc.text(String(invoiceData.sGST  + "%"), 145, 234);
      doc.text(String("Rs"+' ' + sGstAmount.toFixed(2)) , 160, 234);
      doc.text('C.GST % :', 120, 243);
      doc.text(String(invoiceData.cGST  + "%"), 145, 243);
      doc.text(String("Rs"+' ' + cGstAmount.toFixed(2)) , 160, 243);
      doc.setFillColor(245, 245, 245);
      doc.rect(117, 248, 100, 10, 'F');
      doc.setTextColor(0, 0, 0);
      doc.text("Final Amount : ", 120, 254);
      // doc.text(String(invoiceData.finalSubAmount)+ "Rs", 160, 255);
      doc.text(String("Rs"+' ' + finalAmount.toFixed(2)) , 160, 255);




      doc.addImage(logoimg, 'JPEG', 0, 285, 211, 15);

      doc.setFontSize(12);
      doc.setTextColor(33, 52, 66);
      doc.text('PAN NO :', 16, 225);
      doc.text(invoiceData.firmName.panNo, 35, 225);

      // open PDF
      window.open(doc.output('bloburl'));

    };
  }

  generatePDF4Download(invoiceData: any) {
    const doc = new jsPDF();

    // Add image
    const img = new Image();
    img.src = '../assets/company12.1.png';
    const logoimg = new Image();
    logoimg.src = '../assets/company12.2.png';


    img.onload = () => {

      // Add text on top of the image
      doc.addImage(img, 'JPEG', 0, 0, 210, 45);


      // DATE
      doc.setFontSize(15);
      doc.setTextColor(0, 0, 0);
      doc.text('Invoice :', 20, 25);
      doc.text(String(invoiceData.invoiceNumber), 50, 25);
      doc.setFontSize(15);
      doc.setTextColor(0, 0, 0);
      doc.text('Date :', 25, 33);
      doc.text(invoiceData.date, 50, 33);


      // Shop Details 
      doc.setFontSize(25);
      doc.setTextColor(255, 255, 255);
      doc.text(invoiceData.firmName.header, 120, 28);
      doc.setFontSize(10);
      doc.setTextColor(5, 5, 5);
      const addresseLines = doc.splitTextToSize(invoiceData.firmName.address, 60);
      let startYFirm = 75;
      addresseLines.forEach((line: string) => {
        doc.text(line, 14, startYFirm);
        startYFirm += 5;
      });
      doc.text('Mob No:', 14, 85);
      doc.text(String(invoiceData.firmName.mobileNo), 29, 85);
      doc.setFontSize(13);
      doc.setTextColor(0, 0, 0);
      doc.text('GST:', 14, 100);
      doc.text(invoiceData.firmName.gstNo, 28, 100);


      // Customer Details
      doc.setFontSize(15);
      doc.setTextColor(122, 122, 122);
      doc.text('Customer Details', 127, 62);
      doc.setFontSize(12);
      doc.setTextColor(5, 5, 5);
      doc.text(invoiceData.partyName.partyName, 127, 70);
      doc.setFontSize(10);
      doc.setTextColor(5, 5, 5);
      const addressLines = doc.splitTextToSize(invoiceData.partyName.partyAddress, 60);
      let startYCustomer = 75;
      addressLines.forEach((line: string) => {
        doc.text(line, 127, startYCustomer);
        startYCustomer += 5;
      });
      doc.text('Mob No:', 127, 85);
      doc.text(String(invoiceData.partyName.partyMobileNo), 142, 85);
      doc.setFontSize(13);
      doc.setTextColor(0, 0, 0);
      doc.text('GST:', 140, 100);
      doc.text(invoiceData.partyName.partyGstNo, 153, 100);


      // Add table
      const productsSubTotal = invoiceData.products.reduce((acc: any, product: any) => acc + product.finalAmount, 0);
      const productsQty = invoiceData.products.reduce((acc: any, product: any) => acc + product.qty, 0);
      const productsdefectiveItem= invoiceData.products.reduce((acc: any, product: any) => acc + product.defectiveItem, 0);
      
      const bodyRows = invoiceData.products.map((product: any, index: any) => [
        index + 1,
        product.poNumber,
        product.productName.productName,
        product.qty,
        product.defectiveItem,
        product.price,
        product.finalAmount,
      ]);

      // Add empty rows if there are less than 10 products
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
        head: [['Sr.', 'Po Number', 'Product', 'Qty', 'Defective Item', 'Price', 'Final Amount']],
        body: bodyRows,
        startY: 105,
        theme: 'plain',
        headStyles: {
          fillColor: [213, 204, 195],
          textColor: [0, 0, 0],
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

      const discountAmount = (productsSubTotal * (invoiceData.discount / 100));
      const discountedSubTotal = productsSubTotal - discountAmount;
      const sGstAmount = discountedSubTotal * (invoiceData.sGST / 100);
      const cGstAmount = discountedSubTotal * (invoiceData.cGST / 100);
      const finalAmount = discountedSubTotal + sGstAmount + cGstAmount;

      doc.setFontSize(12);
      doc.setTextColor(33, 52, 66);
      doc.setLineWidth(0.2);
      doc.line(89, 219, 196, 219);
      doc.line(89, 228, 196, 228);
      doc.line(89, 237, 196, 237);
      doc.line(89, 246, 196, 246);
      doc.text(String(productsQty), 90, 216);
      doc.text(String(productsdefectiveItem), 103, 216);
      // doc.text('Total : ', 165, 240);
      doc.text(String("Rs"+' ' + productsSubTotal), 160, 216);
      doc.text('Disc % :', 124, 225);
      doc.text(String(invoiceData.discount  + "%"), 145, 225);
      doc.text(String("Rs"+' ' + discountAmount) , 160, 225);
      doc.text('S.GST % :', 120, 234);
      doc.text(String(invoiceData.sGST  + "%"), 145, 234);
      doc.text(String("Rs"+' ' + sGstAmount.toFixed(2)) , 160, 234);
      doc.text('C.GST % :', 120, 243);
      doc.text(String(invoiceData.cGST  + "%"), 145, 243);
      doc.text(String("Rs"+' ' + cGstAmount.toFixed(2)) , 160, 243);
      doc.setFillColor(245, 245, 245);
      doc.rect(117, 248, 100, 10, 'F');
      doc.setTextColor(0, 0, 0);
      doc.text("Final Amount : ", 120, 254);
      // doc.text(String(invoiceData.finalSubAmount)+ "Rs", 160, 255);
      doc.text(String("Rs"+' ' + finalAmount.toFixed(2)) , 160, 255);



      doc.addImage(logoimg, 'JPEG', 0, 272, 211, 25);

      doc.setFontSize(12);
      doc.setTextColor(33, 52, 66);
      doc.text('PAN NO :', 16, 225);
      doc.text(invoiceData.firmName.panNo, 35, 225);

      // open PDF
      window.open(doc.output('bloburl'))

    };

  }

  generatePDF5Download(invoiceData: any){
    const doc = new jsPDF();

    // Add image
    const img = new Image();
    img.src = '../assets/invoice4.1.png';
    const logoimg = new Image();
    logoimg.src = '../assets/invoice4.2.png';


    img.onload = () => {

      // Add text on top of the image
      doc.addImage(img, 'JPEG', 0, 15, 210, 25);


      // DATE
      doc.setFontSize(15);
      doc.setTextColor(255, 255, 255);
      doc.text('Invoice :', 150, 25);
      doc.text(String(invoiceData.invoiceNumber), 174, 25);
      doc.setFontSize(15);
      doc.setTextColor(255, 255, 255);
      doc.text('Date :', 155, 33);
      doc.text(invoiceData.date, 174, 33);


      // Shop Details 
      doc.setFontSize(25);
      doc.setTextColor(0, 0, 0);
      doc.text(invoiceData.firmName.header, 14, 28);
      doc.setFontSize(10);
      doc.setTextColor(5, 5, 5);
      const addresseLines = doc.splitTextToSize(invoiceData.firmName.address, 60);
      let startYFirm = 75;
      addresseLines.forEach((line: string) => {
        doc.text(line, 14, startYFirm);
        startYFirm += 5;
      });
      doc.text('Mob No:', 14, 85);
      doc.text(String(invoiceData.firmName.mobileNo), 29, 85);
      doc.setFontSize(13);
      doc.setTextColor(0, 0, 0);
      doc.text('GST:', 14, 100);
      doc.text(invoiceData.firmName.gstNo, 28, 100);


      // Customer Details
      doc.setFontSize(15);
      doc.setTextColor(122, 122, 122);
      doc.text('Customer Details', 127, 62);
      doc.setFontSize(12);
      doc.setTextColor(5, 5, 5);
      doc.text(invoiceData.partyName.partyName, 127, 70);
      doc.setFontSize(10);
      doc.setTextColor(5, 5, 5);
      const addressLines = doc.splitTextToSize(invoiceData.partyName.partyAddress, 60);
      let startYCustomer = 75;
      addressLines.forEach((line: string) => {
        doc.text(line, 127, startYCustomer);
        startYCustomer += 5;
      });
      doc.text('Mob No:', 127, 85);
      doc.text(String(invoiceData.partyName.partyMobileNo), 142, 85);
      doc.setFontSize(13);
      doc.setTextColor(0, 0, 0);
      doc.text('GST:', 140, 100);
      doc.text(invoiceData.partyName.partyGstNo, 153, 100);


      // Add table
      const productsSubTotal = invoiceData.products.reduce((acc: any, product: any) => acc + product.finalAmount, 0);
      const productsQty = invoiceData.products.reduce((acc: any, product: any) => acc + product.qty, 0);
      const productsdefectiveItem= invoiceData.products.reduce((acc: any, product: any) => acc + product.defectiveItem, 0);
      const bodyRows = invoiceData.products.map((product: any, index: any) => [
        index + 1,
        product.poNumber,
        product.productName.productName,
        product.qty,
        product.defectiveItem,
        product.price,
        product.finalAmount,
      ]);

      // Add empty rows if there are less than 10 products
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
        head: [['Sr.', 'Po Number', 'Product', 'Qty', 'Defective Item', 'Price', 'Final Amount']],
        body: bodyRows,
        startY: 105,
        theme: 'plain',
        headStyles: {
          fillColor: [213, 204, 195],
          textColor: [0, 0, 0],
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
   
      const discountAmount = (productsSubTotal * (invoiceData.discount / 100));
      const discountedSubTotal = productsSubTotal - discountAmount;
      const sGstAmount = discountedSubTotal * (invoiceData.sGST / 100);
      const cGstAmount = discountedSubTotal * (invoiceData.cGST / 100);
      const finalAmount = discountedSubTotal + sGstAmount + cGstAmount;
      doc.setFontSize(12);
      doc.setTextColor(33, 52, 66);
      doc.setLineWidth(0.2);
      doc.line(89, 219, 196, 219);
      doc.line(89, 228, 196, 228);
      doc.line(89, 237, 196, 237);
      doc.line(89, 246, 196, 246);
      doc.text(String(productsQty), 90, 216);
      doc.text(String(productsdefectiveItem), 103, 216);
      // doc.text('Total : ', 165, 240);
      doc.text(String("Rs"+' ' + productsSubTotal), 160, 216);
      doc.text('Disc % :', 124, 225);
      doc.text(String(invoiceData.discount  + "%"), 145, 225);
      doc.text(String("Rs"+' ' + discountAmount) , 160, 225);
      doc.text('S.GST % :', 120, 234);
      doc.text(String(invoiceData.sGST  + "%"), 145, 234);
      doc.text(String("Rs"+' ' + sGstAmount.toFixed(2)) , 160, 234);
      doc.text('C.GST % :', 120, 243);
      doc.text(String(invoiceData.cGST  + "%"), 145, 243);
      doc.text(String("Rs"+' ' + cGstAmount.toFixed(2)) , 160, 243);
      doc.setFillColor(245, 245, 245);
      doc.rect(117, 248, 100, 10, 'F');
      doc.setTextColor(0, 0, 0);
      doc.text("Final Amount : ", 120, 254);
      // doc.text(String(invoiceData.finalSubAmount)+ "Rs", 160, 255);
      doc.text(String("Rs"+' ' + finalAmount.toFixed(2)) , 160, 255);


      doc.addImage(logoimg, 'JPEG', 0, 272, 211, 25);

      doc.setFontSize(12);
      doc.setTextColor(33, 52, 66);
      doc.text('PAN NO :', 16, 225);
      doc.text(invoiceData.firmName.panNo, 35, 225);

      // open PDF
      window.open(doc.output('bloburl'))

    };

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