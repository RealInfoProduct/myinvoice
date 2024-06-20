import { Component, Inject, OnInit, Optional, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router, RouterLink } from '@angular/router';
import { FirebaseService } from 'src/app/services/firebase.service';
import { LoaderService } from 'src/app/services/loader.service';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

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

  generatePDFDownload(invoiceData: any): void {
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
      doc.text(String(productsSubTotal + "Rs"), 183, 240);
      doc.text('Disc % :', 154, 246);
      doc.text(String(invoiceData.discount), 183, 246);
      doc.text('S.GST % :', 159, 252);
      doc.text(String(invoiceData.sGST), 183, 252);
      doc.text('C.GST % :', 159, 258);
      doc.text(String(invoiceData.cGST), 183, 258);
      doc.setFillColor(245, 245, 245);
      doc.rect(142, 261, 90, 10, 'F');
      doc.setTextColor(0, 0, 0);
      doc.text("Final Amount : ", 150, 268);
      doc.text(String(invoiceData.finalSubAmount + "Rs"), 183, 268);

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

  invoice1(invoiceData: any): void {
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





      doc.setFontSize(12);
      doc.setTextColor(33, 52, 66);
      doc.text('Total : ', 165, 230);
      doc.text(String(productsSubTotal + "Rs"), 183, 230);
      doc.text('Disc % :', 154, 236);
      doc.text(String(invoiceData.discount), 183, 236);
      doc.text('S.GST % :', 159, 242);
      doc.text(String(invoiceData.sGST), 183, 242);
      doc.text('C.GST % :', 159, 248);
      doc.text(String(invoiceData.cGST), 183, 248);
      doc.setFillColor(245, 245, 245);
      doc.rect(142, 250, 90, 10, 'F');
      doc.setTextColor(0, 0, 0);
      doc.text("Final Amount : ", 150, 256);
      doc.text(String(invoiceData.finalSubAmount + "Rs"), 183, 256);

      doc.addImage(logoimg, 'JPEG', 0, 267, 211, 30);

      doc.setFontSize(12);
      doc.setTextColor(33, 52, 66);
      doc.text('PAN NO :', 16, 230);
      doc.text(invoiceData.firmName.panNo, 35, 230);

      // open PDF
      window.open(doc.output('bloburl'))



    };

  }

  invoice2(invoiceData: any): void {
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

      doc.setFontSize(12);
      doc.setTextColor(33, 52, 66);
      doc.text('Total : ', 165, 220);
      doc.text(String(productsSubTotal + "Rs"), 183, 220);
      doc.text('Disc % :', 154, 226);
      doc.text(String(invoiceData.discount), 183, 226);
      doc.text('S.GST % :', 159, 232);
      doc.text(String(invoiceData.sGST), 183, 232);
      doc.text('C.GST % :', 159, 238);
      doc.text(String(invoiceData.cGST), 183, 238);
      doc.setFillColor(245, 245, 245);
      doc.rect(142, 240, 90, 10, 'F');
      doc.setTextColor(0, 0, 0);
      doc.text("Final Amount : ", 150, 246);
      doc.text(String(invoiceData.finalSubAmount + "Rs"), 183, 246);


      doc.addImage(logoimg, 'JPEG', 0, 285, 211, 15);

      doc.setFontSize(12);
      doc.setTextColor(33, 52, 66);
      doc.text('PAN NO :', 16, 220);
      doc.text(invoiceData.firmName.panNo, 35, 220);

      // open PDF
      window.open(doc.output('bloburl'));

    };
  }

  invoice3(invoiceData: any): void {
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




      doc.setFontSize(12);
      doc.setTextColor(33, 52, 66);
      doc.text('Total : ', 165, 220);
      doc.text(String(productsSubTotal + "Rs"), 183, 220);
      doc.text('Disc % :', 154, 226);
      doc.text(String(invoiceData.discount), 183, 226);
      doc.text('S.GST % :', 159, 232);
      doc.text(String(invoiceData.sGST), 183, 232);
      doc.text('C.GST % :', 159, 238);
      doc.text(String(invoiceData.cGST), 183, 238);
      doc.setFillColor(245, 245, 245);
      doc.rect(142, 240, 90, 10, 'F');
      doc.setTextColor(0, 0, 0);
      doc.text("Final Amount : ", 150, 246);
      doc.text(String(invoiceData.finalSubAmount + "Rs"), 183, 246);


      doc.addImage(logoimg, 'JPEG', 0, 272, 211, 25);

      doc.setFontSize(12);
      doc.setTextColor(33, 52, 66);
      doc.text('PAN NO :', 16, 220);
      doc.text(invoiceData.firmName.panNo, 35, 220);

      // open PDF
      window.open(doc.output('bloburl'))

    };

  }

  invoice4(invoiceData: any): void {
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




      doc.setFontSize(12);
      doc.setTextColor(33, 52, 66);
      doc.text('Total : ', 165, 220);
      doc.text(String(productsSubTotal + "Rs"), 183, 220);
      doc.text('Disc % :', 154, 226);
      doc.text(String(invoiceData.discount), 183, 226);
      doc.text('S.GST % :', 159, 232);
      doc.text(String(invoiceData.sGST), 183, 232);
      doc.text('C.GST % :', 159, 238);
      doc.text(String(invoiceData.cGST), 183, 238);
      doc.setFillColor(245, 245, 245);
      doc.rect(142, 240, 90, 10, 'F');
      doc.setTextColor(0, 0, 0);
      doc.text("Final Amount : ", 150, 246);
      doc.text(String(invoiceData.finalSubAmount + "Rs"), 183, 246);


      doc.addImage(logoimg, 'JPEG', 0, 272, 211, 25);

      doc.setFontSize(12);
      doc.setTextColor(33, 52, 66);
      doc.text('PAN NO :', 16, 220);
      doc.text(invoiceData.firmName.panNo, 35, 220);

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