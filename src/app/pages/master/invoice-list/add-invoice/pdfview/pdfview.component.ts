import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { DomSanitizer } from '@angular/platform-browser';
import { LoaderService } from 'src/app/services/loader.service';
import { Router } from '@angular/router';
import { FirebaseService } from 'src/app/services/firebase.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-pdfview',
  templateUrl: './pdfview.component.html',
  styleUrls: ['./pdfview.component.scss']
})
export class PdfviewComponent {
  blobUrl: any
  invoiceData :any
  constructor(
    private sanitizer: DomSanitizer,
    private loaderService : LoaderService,
    private firebaseService : FirebaseService,
    private router : Router,
    private _snackBar: MatSnackBar,
  ) {
    if (this.loaderService.getInvoiceData()) {
      this.invoiceData = this.loaderService.getInvoiceData()
      this.generatePDF(this.loaderService.getInvoiceData())
    } else {
      this.router.navigate(['/master/addinvoice'])
    }
    
  }


  generatePDF(invoiceData: any) {
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
      // window.open(doc.output('bloburl'))
      const blobUrlshow: any = doc.output('bloburl')
      this.blobUrl = this.sanitizer.bypassSecurityTrustResourceUrl(blobUrlshow + '#toolbar=0&navpanes=0&scrollbar=0');
    this.loaderService.setLoader(false)
    }
  }


  submitInvoice(){
    this.firebaseService.addInvoice(this.invoiceData).then((res) => {
      if (res) {
          this.openConfigSnackBar('record create successfully')
          this.generatePDFDownload(this.invoiceData)
          this.router.navigate(['/master/addinvoice'])
        }
    } , (error) => {
      this.openConfigSnackBar(error.error.error.message)
      
    })
  }

  openConfigSnackBar(snackbarTitle: any) {
    this._snackBar.open(snackbarTitle, 'Splash', {
      duration: 2 * 1000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }


  generatePDFDownload(invoiceData: any) {
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
