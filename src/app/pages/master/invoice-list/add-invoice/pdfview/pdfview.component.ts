import { Component, Inject, OnInit } from '@angular/core';
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
export class PdfviewComponent  implements OnInit{
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
  ngOnInit(): void {
   
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
        head: [['Sr.','Po Number' , 'Product', 'Qty', 'Defective Item', 'Price', 'Final Amount']],
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
    // doc.text('Total : ', 165, 240);
    doc.text(String("Rs" + productsSubTotal), 160, 207);
    doc.text('Disc % :', 124, 215);
    doc.text(String(invoiceData.discount), 145, 215);
    doc.text(String("Rs" + discountAmount) , 160, 215);
    doc.text('S.GST % :', 120, 224);
    doc.text(String(invoiceData.sGST), 145, 224);
    doc.text(String("Rs" + sGstAmount.toFixed(2)) , 160, 224);
    doc.text('C.GST % :', 120, 234);
    doc.text(String(invoiceData.cGST), 145, 234);
    doc.text(String("Rs" + cGstAmount.toFixed(2)) , 160, 234);
    doc.setFillColor(245, 245, 245);
    doc.rect(117, 238, 100, 10, 'F');
    doc.setTextColor(0, 0, 0);
    doc.text("Final Amount : ", 120, 244);
    // doc.text(String(invoiceData.finalSubAmount)+ "Rs", 160, 244);
    doc.text(String("Rs" + finalAmount.toFixed(2)) , 160, 244);


      // PAN NO
      doc.setFontSize(12);
      doc.setTextColor(33, 52, 66);
      doc.text('PAN NO :', 16, 215);
      doc.text(invoiceData.firmName.panNo, 35, 215);


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
    doc.text(String("Rs" + productsSubTotal), 160, 207);
    doc.text('Disc % :', 124, 215);
    doc.text(String(invoiceData.discount), 145, 215);
    doc.text(String("Rs" + discountAmount), 160, 215);
    doc.text('S.GST % :', 120, 224);
    doc.text(String(invoiceData.sGST), 145, 224);
    doc.text(String("Rs" + sGstAmount.toFixed(2)), 160, 224);
    doc.text('C.GST % :', 120, 234);
    doc.text(String(invoiceData.cGST), 145, 234);
    doc.text(String("Rs" + cGstAmount.toFixed(2)), 160, 234);
    doc.setFillColor(245, 245, 245);
    doc.rect(117, 238, 100, 10, 'F');
    doc.setTextColor(0, 0, 0);
    doc.text("Final Amount : ", 120, 244);
    // doc.text(String(invoiceData.finalSubAmount)+ "Rs", 160, 244);
        doc.text(String("Rs" + finalAmount.toFixed(2)) , 160, 244);

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
}
