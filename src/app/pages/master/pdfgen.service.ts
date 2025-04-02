import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { LoaderService } from 'src/app/services/loader.service';
import { ToWords } from 'to-words';
@Injectable({
  providedIn: 'root'
})
export class PdfgenService {
  toWords = new ToWords({
    localeCode: 'en-IN',
    converterOptions: {
      currency: true,
      ignoreDecimal: false,
      ignoreZeroCurrency: false,
    },
  });
  constructor(private loaderService: LoaderService) { }

  generatePDF1Download(invoiceData: any) {
    this.loaderService.setLoader(true)
    const doc: any = new jsPDF();
    const header = (doc: any) => {
      doc.setFillColor('#fff');
      doc.rect(0, 0, doc.internal.pageSize.width, 10, 'F');
      const yPosition = 10;

      doc.setFillColor('#ffbb00');
      const rowHeight = 18;
      doc.rect(0, yPosition - rowHeight, doc.internal.pageSize.width, rowHeight, 'F');

      doc.setFontSize(12); doc.setTextColor(0, 0, 0); const verticalCenter = yPosition - rowHeight / 2 + 6;
      const phoneNumberLeft = `Mo. : ${invoiceData.firmName.mobileNo}`; const leftXPosition = 10;
      doc.text(phoneNumberLeft, leftXPosition, verticalCenter, { align: 'left' });

      const phoneNumberMiddle = "Jay Shree Ganesh"; const middleXPosition = doc.internal.pageSize.width / 2;
      doc.text(phoneNumberMiddle, middleXPosition, verticalCenter, { align: 'center' });

      const borderYPosition = yPosition + 6;
      const topMargin = 4;
      const bottomMargin = 4;
      const logoYPosition = borderYPosition + topMargin;

      // Step 1: Add Firm Name (Bold & Centered)
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');

      const firmName = invoiceData.firmName.header;
      const firmNameWidth = doc.getTextWidth(firmName);
      const firmNameX = (pageWidth - firmNameWidth) / 2;
      const firmNameY = 20; // Starting Y position

      doc.text(firmName, firmNameX, firmNameY);

      // Step 2: Add Subheader (Italic & Centered, below Firm Name)
      doc.setFontSize(10);
      doc.setFont('helvetica', 'italic');

      const subHeader = invoiceData.firmName.subHeader;
      const subHeaderWidth = doc.getTextWidth(subHeader);
      const subHeaderX = (pageWidth - subHeaderWidth) / 2;
      const subHeaderY = firmNameY + 8; // 8px gap below Firm Name

      doc.text(subHeader, subHeaderX, subHeaderY);

      // Step 3: Add Address (Centered Below Subheader, supports multiple lines)
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal'); // Reset font to normal

      const address = invoiceData.firmName.address;
      const maxWidth = pageWidth - 20; // Adjust width for better centering
      const lineHeight = 5;
      const addressLines = doc.splitTextToSize(address, maxWidth);
      const addressStartY = subHeaderY + 8; // 8px gap below Subheader

      addressLines.forEach((line: string, index: number) => {
        const textWidth = doc.getTextWidth(line);
        const centerX = (pageWidth - textWidth) / 2; // Center text horizontally
        const yPosition = addressStartY + (index * lineHeight);
        doc.text(line, centerX, yPosition);
      });
    };

    const lineTopYPosition = 43.7;
    doc.setLineWidth(0.3);
    doc.line(0, lineTopYPosition, doc.internal.pageSize.width, lineTopYPosition);

    doc.setFontSize(10);
    doc.setFillColor('#eee')
    const mobileNumberLeft = `GSTIN: ${invoiceData.firmName.gstNo}`;
    const mobileNumberRight = `PAN: ${invoiceData.firmName.panNo}`;

    const leftXPosition = 10;
    const yPosition = 50;
    const backgroundHeight = 9;

    doc.rect(0, yPosition - 6, doc.internal.pageSize.width, backgroundHeight, 'F');
    doc.text(mobileNumberLeft, leftXPosition, yPosition, { align: 'left' });
    doc.text(mobileNumberRight, doc.internal.pageSize.width - 10, yPosition, { align: 'right' });

    const lineYPosition = yPosition + 3;

    doc.setLineWidth(0.3);
    doc.line(0, lineYPosition, doc.internal.pageSize.width, lineYPosition)

    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    const boxHeight = 35;
    const boxYPosition = 55;

    const box1Width = pageWidth * 0.75;
    const box1XPosition = 10;
    doc.setFillColor('#fff');
    doc.rect(box1XPosition, boxYPosition, box1Width, boxHeight, 'F');

    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);

    const fieldsLeft = ["M/s:", "Address:", "GSTIN:"];
    const fieldsLeftValues = [
      `${invoiceData.partyName.partyName }`,
      `${invoiceData.partyName.partyAddress}`,
      `${invoiceData.partyName.partyGstNo}`
    ];

    const leftYPosition = boxYPosition + 5;
    const boxWidth = doc.internal.pageSize.width * 0.63 - box1XPosition - 10;
    const labelXPosition = box1XPosition;
    const valueXPosition = box1XPosition + 18;

    fieldsLeft.forEach((field, index) => {
      const yPosition = leftYPosition + (index * 9.5);
      doc.text(field, labelXPosition, yPosition);
      doc.text(fieldsLeftValues[index], valueXPosition, yPosition);

      const lineYPosition = yPosition + 1;
      doc.setLineWidth(0.3);
      doc.line(valueXPosition, lineYPosition, valueXPosition + boxWidth, lineYPosition);
    });

    const box2Width = pageWidth * 0.25;
    const box2XPosition = box1XPosition + box1Width + 5;
    doc.setFillColor('#fff');
    doc.rect(box2XPosition - 25, boxYPosition, box2Width, boxHeight, 'F');

    const fieldsRight = ["Invoice: ", "Date: ", "PAN: "];
    const fieldsRightValues = [`${invoiceData.invoiceNumber}`, `${invoiceData.date}`, `${invoiceData.partyName.partyPanNo}`]; // Corresponding values
    const rightYPosition = boxYPosition + 5;

    fieldsRight.forEach((field, index) => {
      const yPosition = rightYPosition + (index * 9.5);

      if (index === 0) {
        doc.setTextColor(255, 0, 0);
      } else {
        doc.setTextColor(0, 0, 0); 
      }

      doc.text(field, box2XPosition - 25, yPosition);
      const textWidth = doc.getTextWidth(field);

      doc.setTextColor(0, 0, 0);

      if (index === 1) {
        doc.setFont(undefined, 'bold'); 
      }
      const valueXPosition = (box2XPosition - 28) + textWidth + 5;
      const valueYPosition = yPosition;
      doc.text(fieldsRightValues[index], valueXPosition, valueYPosition);

      if (index === 1) {
        doc.setFont(undefined, 'normal');
      }

      const lineYPosition = valueYPosition + 1;
      doc.setLineWidth(0.3);
      doc.line((box2XPosition - 25) + textWidth + 2, lineYPosition, (box2XPosition - 25) + box2Width, lineYPosition);
    });

    const columns = ["Sr", "Product", "Chalan No",  "Qty", "Plain", "Rate", "Amount"];
    const data: any = invoiceData.products;
    data.forEach((ele: any) => { ele.total = Number(ele.qty) * Number(ele.price) })
    const body: any = [];
    for (let i = 0; i < 10; i++) {
      const bodyRows = [
        i + 1, // Convert number to string
        data[i]?.productName?.productName ? data[i]?.productName?.productName : '',
        data[i]?.poNumber ? data[i]?.poNumber.toString() : '',
        data[i]?.qty ? Number(data[i]?.qty).toFixed(2).toString() : '',
        data[i]?.defectiveItem ? Number(data[i]?.defectiveItem).toFixed(2).toString() : '',
        data[i]?.price ? Number(data[i]?.price).toFixed(2).toString() : '',
        data[i]?.finalAmount ? `${Number(data[i]?.finalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : ''
      ];
      body.push(bodyRows);
    }

    const productsSubTotal = invoiceData.products.reduce((acc: any, product: any) => acc + product.finalAmount, 0);
    const discountAmount = (productsSubTotal * (invoiceData.discount / 100));
    const discountedSubTotal = productsSubTotal - discountAmount;
    const sGstAmount = discountedSubTotal * (invoiceData.sGST / 100);
    const cGstAmount = discountedSubTotal * (invoiceData.cGST / 100);
    const finalAmount = discountedSubTotal + sGstAmount + cGstAmount;

    const formattedAmount = new Intl.NumberFormat('en-IN').format(parseFloat(productsSubTotal.toFixed(2)));
    const Amount = new Intl.NumberFormat('en-IN').format(parseFloat(finalAmount.toFixed(2))); 
    const discountAmountFormatted = discountAmount.toFixed(2);
    const sGstAmountFormatted = sGstAmount.toFixed(2);
    const cGstAmountFormatted = cGstAmount.toFixed(2);
    const roundedAmount = Math.round(finalAmount);
    const formattedRoundedAmount = new Intl.NumberFormat('en-IN').format(roundedAmount);
    const finalAmountInWords = this.toWords.convert(Number(roundedAmount));
    body.push(
      ['', '', '', '', '', { content: 'Gross Total', styles: { halign: 'left' } }, `Rs. ${formattedAmount}`],
      ['', '', '', '', '', { content: `Discount ${invoiceData.discount}%`, styles: { halign: 'left' } }, `Rs. ${discountAmountFormatted}`],
      ['', '', '', '', '', { content: `CGST ${invoiceData.cGST}%` }, `Rs. ${cGstAmountFormatted}`],
      [{ content: `${finalAmountInWords}`, rowSpan: 3, colSpan: 5, styles: { halign: 'center', fontStyle: 'bold' } }, `SGST ${invoiceData.sGST}%`, `Rs. ${sGstAmountFormatted}`],
      [{ content: 'Total Amount' }, `Rs. ${Amount}`, { styles: { FontFace: 'left' } }],
      [{ content: 'Final Amount' }, `Rs. ${formattedRoundedAmount}.00`, { styles: { FontFace: 'left' } }],
    );

    const footer = (doc: any, pageNumber: any, totalPages: any) => {
      doc.setFontSize(10);
      doc.setTextColor(150);
      doc.text(`Page ${pageNumber} of ${totalPages}`, doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 10, { align: 'center' });
      doc.line(10, doc.internal.pageSize.height - 15, doc.internal.pageSize.width - 10, doc.internal.pageSize.height - 15);
    };

    autoTable(doc, {
      head: [columns],
      body: body,
      startY: 90,
      theme: 'plain',
      margin: { top: 0, right: 10, bottom: 0, left: 10 },
      tableWidth: 'auto',
      headStyles: {
        fillColor: '#ffbb00',
        textColor: '#000',
        fontSize: 11,
        font: 'helvetica',
        fontStyle: 'bold',
        cellPadding: 3,
        lineWidth: 0.50
      },
      styles: {
        cellPadding: 2,
        lineWidth: 0.1,
        lineColor: [0, 0, 0]
      },
      didParseCell: (data) => {
        const { row, column } = data;
        const lastRowIndex = body.length;

        if (row.index >= lastRowIndex - 6 && row.index <= lastRowIndex - 1 && (column.index === 5 || column.index === 6)) {
          data.cell.styles.fontStyle = 'bold';
        }

        if (data.row.index === body.length - 1) {
          data.cell.styles.textColor = '#000';
          data.cell.styles.fillColor = '#ffbb00';
          data.cell.styles.fontStyle = 'bold';
        }

        if (data.row.index === body.length) {
          data.cell.styles.textColor = '#000';
          data.cell.styles.fillColor = '#eee';
        }
      },
      didDrawPage: (data) => {
        header(doc);
        const pageNumber = doc.internal.getNumberOfPages();
        footer(doc, pageNumber, pageNumber);
      },
    });

    doc.setFontSize(13);
    doc.setTextColor(0, 0, 0);
    doc.text('Bank Name:', 14, 243);
    doc.text(invoiceData.firmName.bankName, 65, 243);

    doc.setFontSize(13);
    doc.setTextColor(0, 0, 0);
    doc.text('Account holder`s name:', 14, 251);
    doc.text(invoiceData.firmName.accountholdersname, 65, 251);

    doc.setFontSize(13);
    doc.setTextColor(0, 0, 0);
    doc.text('Account Number:', 14, 259);
    const accountNumber = invoiceData.firmName?.bankAccountNo?.toString() || "";
    doc.text(accountNumber, 65, 259);

    doc.setFontSize(13);
    doc.setTextColor(0, 0, 0);
    doc.text('IFSC Code:', 14, 268);
    doc.text(invoiceData.firmName.bankIfsc, 65, 268);
    
    const signatureYPosition = doc.internal.pageSize.height - 35;
    const signatureXPosition = doc.internal.pageSize.width - 60;
    const signatureLineLength = 50;
    const signatureLabelYPosition = signatureYPosition + 10;

    doc.setFontSize(11);
    doc.setTextColor('#ddd');
    doc.text("Signature", signatureXPosition + 17, signatureLabelYPosition);

    doc.setLineWidth(0.2);
    doc.line(signatureXPosition, signatureLabelYPosition + 5, signatureXPosition + signatureLineLength, signatureLabelYPosition + 5);

    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);
    window.open(url);
    this.loaderService.setLoader(false)
  }

  addTextWithFontSize(doc: any, text: any, x: any, y: any, fontSize: any) {
    const originalFontSize = doc.internal.getFontSize();
    doc.setFontSize(fontSize);
    doc.text(text, x, y);
    doc.setFontSize(originalFontSize);
  }

  // generatePDF1Download(invoiceData: any) {
  //   this.loaderService.setLoader(true)

  //   const doc = new jsPDF();

  //   // Add image
  //   const img = new Image();
  //   img.src = '../assets/hospital11.1.png';
  //   const logoimg = new Image();
  //   logoimg.src = '../assets/hospital11.2.png';


  //   img.onload = () => {

  //     // Add text on top of the image
  //     doc.addImage(img, 'JPEG', 0, 0, 220, 50);

  //     // doc.setFontSize(16);
  //     // doc.setTextColor(5, 5, 5);
  //     // doc.text('Invoice:', 161, 18);
  //     // doc.text(String(invoiceData.invoiceNumber), 182, 18);
  //     // doc.setFontSize(16);
  //     // doc.setTextColor(5, 5, 5);
  //     // doc.text('Date:', 161, 27);
  //     // doc.text(invoiceData.date, 175, 27);
  //     doc.setFontSize(16);
  //     doc.setTextColor(5, 5, 5);

  //     const tableRows = [
  //       ['Invoice No.', String(invoiceData.invoiceNumber)],
  //       ['Date', invoiceData.date]
  //     ];

  //     // Add table using autoTable
  //     autoTable(doc, {
  //       startY: 10, // Adjust starting Y position
  //       body: tableRows,
  //       theme: 'grid', // 'striped', 'plain', or 'grid'
  //       styles: {
  //         fontSize: 14,  // Increase font size
  //         cellPadding: 5, // Increase padding inside cells
  //         lineWidth: 0.1 // Adjust border thickness
  //       },
  //       headStyles: {
  //         fillColor: [5, 5, 5],
  //         textColor: [5,5,5]
  //       },
  //       columnStyles: {
  //         0: { fontStyle: 'bold', cellWidth: 40 }, // Adjust column width
  //         1: { cellWidth: 40 } // Adjust column width for values
  //       },
  //       margin: { top: 10, left: 50, right: 10 }, // Add margins
  //       rowPageBreak: 'avoid' // Prevent table from splitting across pages
  //     });


  //     //       // Shop Details

  //     doc.setFontSize(25);
  //     doc.setTextColor(255, 255, 255);
  //     doc.text(invoiceData.firmName.header, 15, 17);
  //     doc.setFontSize(10);
  //     doc.setTextColor(5, 5, 5);
  //     const addresseLines = doc.splitTextToSize(invoiceData.firmName.address, 60);
  //     let startYFirm = 60;
  //     addresseLines.forEach((line: string) => {
  //       doc.text(line, 15, startYFirm);
  //       startYFirm += 5;
  //     });
  //     doc.text('Mob No:', 15, 70);
  //     doc.text(String(invoiceData.firmName.mobileNo), 30, 70);
  //     doc.setFontSize(13);
  //     doc.setTextColor(0, 0, 0);
  //     doc.text('GST:', 14, 90);
  //     doc.text(invoiceData.firmName.gstNo, 28, 90);


  //     //  //  Customer Details
  //     doc.setFontSize(15);
  //     doc.setTextColor(122, 122, 122);
  //     doc.text('Customer Details', 130, 45);
  //     doc.setFontSize(12);
  //     doc.setTextColor(5, 5, 5);
  //     doc.text(invoiceData.partyName.partyName, 130, 55);
  //     doc.setFontSize(10);
  //     const addressLines = doc.splitTextToSize(invoiceData.partyName.partyAddress, 60);
  //     let startYCustomer = 60;
  //     addressLines.forEach((line: string) => {
  //       doc.text(line, 130, startYCustomer);
  //       startYCustomer += 5;
  //     });
  //     doc.text('Mob No :', 130, 70);
  //     doc.text(String(invoiceData.partyName.partyMobileNo), 147, 70);
  //     doc.setFontSize(13);
  //     doc.setTextColor(0, 0, 0);
  //     doc.text('GST :', 138, 90);
  //     doc.text(invoiceData.partyName.partyGstNo, 152, 90);

  //     const productsSubTotal = invoiceData.products.reduce((acc: any, product: any) => acc + product.finalAmount, 0);
  //     const productsQty = invoiceData.products.reduce((acc: any, product: any) => acc + product.qty, 0);
  //     const productsdefectiveItem = invoiceData.products.reduce((acc: any, product: any) => acc + product.defectiveItem, 0);

  //     const bodyRows = invoiceData.products.map((product: any, index: any) => [
  //       index + 1,
  //       product.poNumber,
  //       product.productName.productName,
  //       product.qty,
  //       product.defectiveItem,
  //       product.price,
  //       product.finalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  //     ]);

  //     // Add empty rows if there are less than 10 products
  //     while (bodyRows.length < 11) {
  //       bodyRows.push([
  //         '',
  //         '',
  //         '',
  //         '',
  //         '',
  //         '',
  //         '',
  //       ]);
  //     }
  //     (doc as any).autoTable({
  //       head: [['Sr.', 'Po Number', 'Product', 'Qty', 'Defective Item', 'Price', 'Final Amount']],
  //       body: bodyRows,
  //       startY: 95,
  //       theme: 'plain',
  //       headStyles: {
  //         fillColor: [0, 62, 95],
  //         textColor: [255, 255, 255],
  //         fontSize: 10,
  //         cellPadding: 2,
  //       },
  //       bodyStyles: {
  //         textColor: [0, 0, 0],
  //         halign: 'left',
  //         fontSize: 12,
  //       },
  //       didDrawCell: (data: any) => {
  //         const { cell, row, column } = data;

  //         doc.setDrawColor(122, 122, 122);
  //         doc.setLineWidth(0.2);

  //         doc.line(cell.x, cell.y + cell.height, cell.x + cell.width, cell.y + cell.height);
  //         doc.line(cell.x + cell.width, cell.y, cell.x + cell.width, cell.y + cell.height);
  //         doc.line(cell.x, cell.y, cell.x, cell.y + cell.height);
  //       }
  //     });


  //     doc.addImage(logoimg, 'JPEG', 0, 272, 210, 25);
  //     const discountAmount = (productsSubTotal * (invoiceData.discount / 100));
  //     const discountedSubTotal = productsSubTotal - discountAmount;
  //     const sGstAmount = discountedSubTotal * (invoiceData.sGST / 100);
  //     const cGstAmount = discountedSubTotal * (invoiceData.cGST / 100);
  //     const finalAmount = discountedSubTotal + sGstAmount + cGstAmount;

  //     doc.setFontSize(12);
  //     doc.setTextColor(33, 52, 66);
  //     doc.setLineWidth(0.2);
    
  //     doc.line(115, 205, 196, 205);
  //     doc.line(115, 214, 196, 214);
  //     doc.line(115, 223, 196, 223);
  //     doc.line(115, 195, 115, 223);
  //     doc.line(196, 195, 196, 223); 
  //     doc.text(String(productsQty), 90, 193);
  //     doc.text(String(productsdefectiveItem), 103, 193);
 
  //     doc.text("Rs " + productsSubTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), 160, 193);
  //     doc.text('Disc % :', 124, 202);
  //     doc.text(String(invoiceData.discount + "%"), 145, 202);
  //     doc.text("Rs" + ' ' + discountAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), 160, 202);
  //     doc.text('S.GST % :', 120, 211);
  //     doc.text(String(invoiceData.sGST + "%"), 145, 211);
  //     doc.text("Rs" + ' ' + sGstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), 160, 211);
  //     doc.text('C.GST % :', 120, 220);
  //     doc.text(String(invoiceData.cGST + "%"), 145, 220);
  //     doc.text("Rs" + ' ' + cGstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), 160, 220);
  //     doc.setFillColor(245, 245, 245);
  //     doc.rect(117, 229, 100, 10, 'F');
  //     doc.setTextColor(0, 0, 0);
  //     doc.text("Final Amount : ", 120, 235);
  //     doc.text("Rs" + ' ' + finalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), 160, 235);

  //     // PAN NO
  //     doc.setFontSize(12);
  //     doc.setTextColor(33, 52, 66);
  //     doc.text('PAN NO :', 16, 215);
  //     doc.text(invoiceData.firmName.panNo, 35, 215);

  //     // open PDF
  //     window.open(doc.output('bloburl'))
  //     this.loaderService.setLoader(false)

  //   }
  // }

  // generatePDF2Download(invoiceData: any) {
  //   console.log("invoiceData==>", invoiceData);

  //   const doc = new jsPDF();

  //   // Add image
  //   const img = new Image();
  //   img.src = '../assets/header.png';
  //   const logoimg = new Image();
  //   logoimg.src = '../assets/footer.png';

  //   img.onload = () => {
  //     doc.addImage(img, 'JPEG', 0, 0, 211, 60);
  //     // Add text on top of the image



  //     doc.setFontSize(11);
  //     doc.setTextColor(122, 122, 122);
  //     doc.text('Invoice :', 130, 55);
  //     doc.text(String(invoiceData.invoiceNumber), 145, 55);
  //     doc.setFontSize(11);
  //     doc.setTextColor(5, 5, 5);
  //     doc.text('Date :', 165, 55);
  //     doc.text(invoiceData.date, 177, 55);

  //     // Shop Details
  //     doc.setFontSize(25);
  //     doc.setTextColor(5, 5, 5);
  //     doc.text(invoiceData.firmName.header, 110, 30);
  //     doc.setFontSize(10);
  //     doc.setTextColor(5, 5, 5);
  //     const addresseLines = doc.splitTextToSize(invoiceData.firmName.address, 60);
  //     let startYFirm = 85;
  //     addresseLines.forEach((line: string) => {
  //       doc.text(line, 14, startYFirm);
  //       startYFirm += 5;
  //     });
  //     doc.text('Mob No:', 14, 95);
  //     doc.text(String(invoiceData.firmName.mobileNo), 29, 95);
  //     doc.setFontSize(13);
  //     doc.setTextColor(0, 0, 0);
  //     doc.text('GST:', 14, 110);
  //     doc.text(invoiceData.firmName.gstNo, 28, 110);

  //     //  Customer Details
  //     doc.setFontSize(15);
  //     doc.setTextColor(122, 122, 122);
  //     doc.text('Customer Details', 127, 70);
  //     doc.setFontSize(12);
  //     doc.setTextColor(5, 5, 5);
  //     doc.text(invoiceData.partyName.partyName, 127, 80);
  //     doc.setFontSize(10);
  //     doc.setTextColor(5, 5, 5);
  //     const addressLines = doc.splitTextToSize(invoiceData.partyName.partyAddress, 60);
  //     let startYCustomer = 85;
  //     addressLines.forEach((line: string) => {
  //       doc.text(line, 127, startYCustomer);
  //       startYCustomer += 5;
  //     });
  //     doc.text('Mob No:', 127, 95);
  //     doc.text(String(invoiceData.partyName.partyMobileNo), 142, 95);
  //     doc.setFontSize(13);
  //     doc.setTextColor(0, 0, 0);
  //     doc.text('GST:', 140, 110);
  //     doc.text(invoiceData.partyName.partyGstNo, 153, 110);


  //     const productsSubTotal = invoiceData.products.reduce((acc: any, product: any) => acc + product.finalAmount, 0);
  //     const productsQty = invoiceData.products.reduce((acc: any, product: any) => acc + product.qty, 0);
  //     const productsdefectiveItem = invoiceData.products.reduce((acc: any, product: any) => acc + product.defectiveItem, 0);

  //     const bodyRows = invoiceData.products.map((product: any, index: any) => [
  //       index + 1,
  //       product.poNumber,
  //       product.productName.productName,
  //       product.qty,
  //       product.defectiveItem,
  //       product.price,
  //       product.finalAmount,
  //     ]);

  //     // Add empty rows if there are less than 10 products
  //     while (bodyRows.length < 10) {
  //       bodyRows.push([
  //         '',
  //         '',
  //         '',
  //         '',
  //         '',
  //         '',
  //         '',
  //       ]);
  //     }
  //     (doc as any).autoTable({
  //       head: [['Sr.', 'Po Number', 'Product', 'Qty', 'Defective Item', 'Price', 'Final Amount']],
  //       body: bodyRows,
  //       startY: 115,
  //       theme: 'plain',
  //       headStyles: {
  //         fillColor: [0, 62, 95],
  //         textColor: [255, 255, 255],
  //         fontSize: 10,
  //         cellPadding: 2,
  //       },
  //       bodyStyles: {
  //         textColor: [0, 0, 0],
  //         halign: 'left',
  //         fontSize: 15,
  //       },
  //       didDrawCell: (data: any) => {
  //         const { cell, row, column } = data;
  //         if (row.section === 'body') {
  //           doc.setDrawColor(122, 122, 122);
  //           doc.setLineWidth(0.2);
  //           doc.line(cell.x, cell.y + cell.height, cell.x + cell.width, cell.y + cell.height);
  //         }

  //       }

  //     });


  //     const discountAmount = (productsSubTotal * (invoiceData.discount / 100));
  //     const discountedSubTotal = productsSubTotal - discountAmount;
  //     const sGstAmount = discountedSubTotal * (invoiceData.sGST / 100);
  //     const cGstAmount = discountedSubTotal * (invoiceData.cGST / 100);
  //     const finalAmount = discountedSubTotal + sGstAmount + cGstAmount;


  //     doc.setFontSize(12);
  //     doc.setTextColor(33, 52, 66);
  //     doc.setLineWidth(0.2);
  //     doc.line(89, 228, 196, 228);
  //     doc.line(89, 237, 196, 237);
  //     doc.line(89, 246, 196, 246);
  //     doc.line(89, 255, 196, 255);
  //     doc.text(String(productsQty), 90, 225);
  //     doc.text(String(productsdefectiveItem), 103, 225);
  //     // doc.text('Total : ', 165, 240);
  //     doc.text(String("Rs" + ' ' + productsSubTotal.toFixed(2)), 160, 225);
  //     doc.text('Disc % :', 124, 234);
  //     doc.text(String(invoiceData.discount + "%"), 145, 234);
  //     doc.text(String("Rs" + ' ' + discountAmount.toFixed(2)), 160, 234);
  //     doc.text('S.GST % :', 120, 243);
  //     doc.text(String(invoiceData.sGST + "%"), 145, 243);
  //     doc.text(String("Rs" + ' ' + sGstAmount.toFixed(2)), 160, 243);
  //     doc.text('C.GST % :', 120, 252);
  //     doc.text(String(invoiceData.cGST + "%"), 145, 252);
  //     doc.text(String("Rs" + ' ' + cGstAmount.toFixed(2)), 160, 252);
  //     doc.setFillColor(245, 245, 245);
  //     doc.rect(117, 256, 100, 10, 'F');
  //     doc.setTextColor(0, 0, 0);
  //     doc.text("Final Amount : ", 120, 262);
  //     // doc.text(String(invoiceData.finalSubAmount)+ "Rs", 160, 262);
  //     doc.text(String("Rs" + ' ' + finalAmount.toFixed(2)), 160, 262);



  //     doc.addImage(logoimg, 'JPEG', 0, 267, 211, 30);

  //     // PAN NO
  //     doc.setFontSize(12);
  //     doc.setTextColor(33, 52, 66);
  //     doc.text('PAN NO :', 16, 234);
  //     doc.text(invoiceData.firmName.panNo, 35, 234);

  //     // open PDF
  //     window.open(doc.output('bloburl'))



  //   };

  // }

  // generatePDF3Download(invoiceData: any) {
  //   const doc = new jsPDF();

  //   const img = new Image();
  //   img.src = '../assets/Group1.png';
  //   const logoimg = new Image();
  //   logoimg.src = '../assets/Group(2).png';

  //   img.onload = () => {
  //     doc.addImage(img, 'JPEG', 0, 10, 211, 30);
  //     // Add text on top of the image



  //     //date and invoice no
  //     doc.setFontSize(15);
  //     doc.setTextColor(255, 255, 255);
  //     doc.text('Invoice :', 20, 25);
  //     doc.text(String(invoiceData.invoiceNumber), 42, 25);
  //     doc.setFontSize(15);
  //     doc.setTextColor(255, 255, 255);
  //     doc.text('Date :', 25, 33);
  //     doc.text(invoiceData.date, 42, 33);



  //     // Shop Details
  //     doc.setFontSize(25);
  //     doc.setTextColor(255, 255, 255);
  //     doc.text(invoiceData.firmName.header, 120, 28);
  //     doc.setFontSize(10);
  //     doc.setTextColor(5, 5, 5);
  //     const addresseLines = doc.splitTextToSize(invoiceData.firmName.address, 60);
  //     let startYFirm = 70;
  //     addresseLines.forEach((line: string) => {
  //       doc.text(line, 14, startYFirm);
  //       startYFirm += 5;
  //     });
  //     doc.text('Mob No:', 14, 80);
  //     doc.text(String(invoiceData.firmName.mobileNo), 29, 80);
  //     doc.setFontSize(13);
  //     doc.setTextColor(0, 0, 0);
  //     doc.text('GST:', 14, 100);
  //     doc.text(invoiceData.firmName.gstNo, 28, 100);

  //     //  Customer Details
  //     doc.setFontSize(15);
  //     doc.setTextColor(122, 122, 122);
  //     doc.text('Customer Details', 127, 58);
  //     doc.setFontSize(12);
  //     doc.setTextColor(5, 5, 5);
  //     doc.text(invoiceData.partyName.partyName, 127, 65);
  //     doc.setFontSize(10);
  //     doc.setTextColor(5, 5, 5);
  //     const addressLines = doc.splitTextToSize(invoiceData.partyName.partyAddress, 60);
  //     let startYCustomer = 70;
  //     addressLines.forEach((line: string) => {
  //       doc.text(line, 127, startYCustomer);
  //       startYCustomer += 5;
  //     });
  //     doc.text('Mob No:', 127, 80);
  //     doc.text(String(invoiceData.partyName.partyMobileNo), 142, 80);
  //     doc.setFontSize(13);
  //     doc.setTextColor(0, 0, 0);
  //     doc.text('GST:', 140, 100);
  //     doc.text(invoiceData.partyName.partyGstNo, 153, 100);



  //     // Add table
  //     const productsSubTotal = invoiceData.products.reduce((acc: any, product: any) => acc + product.finalAmount, 0);
  //     const productsQty = invoiceData.products.reduce((acc: any, product: any) => acc + product.qty, 0);
  //     const productsdefectiveItem = invoiceData.products.reduce((acc: any, product: any) => acc + product.defectiveItem, 0);

  //     const bodyRows = invoiceData.products.map((product: any, index: any) => [
  //       index + 1,
  //       product.poNumber,
  //       product.productName.productName,
  //       product.qty,
  //       product.defectiveItem,
  //       product.price,
  //       product.finalAmount,
  //     ]);

  //     // Add empty rows if there are less than 10 products
  //     while (bodyRows.length < 10) {
  //       bodyRows.push([
  //         '',
  //         '',
  //         '',
  //         '',
  //         '',
  //         '',
  //         '',
  //       ]);
  //     }
  //     (doc as any).autoTable({
  //       head: [['Sr.', 'Po Number', 'Product', 'Qty', 'Defective Item', 'Price', 'Final Amount']],
  //       body: bodyRows,
  //       startY: 105,
  //       theme: 'plain',
  //       headStyles: {
  //         fillColor: [0, 62, 95],
  //         textColor: [255, 255, 255],
  //         fontSize: 10,
  //         cellPadding: 2,
  //       },
  //       bodyStyles: {
  //         textColor: [0, 0, 0],
  //         halign: 'left',
  //         fontSize: 15,
  //       },
  //       didDrawCell: (data: any) => {
  //         const { cell, row, column } = data;
  //         if (row.section === 'body') {
  //           doc.setDrawColor(122, 122, 122);
  //           doc.setLineWidth(0.2);
  //           doc.line(cell.x, cell.y + cell.height, cell.x + cell.width, cell.y + cell.height);
  //         }

  //       }

  //     });
  //     const discountAmount = (productsSubTotal * (invoiceData.discount / 100));
  //     const discountedSubTotal = productsSubTotal - discountAmount;
  //     const sGstAmount = discountedSubTotal * (invoiceData.sGST / 100);
  //     const cGstAmount = discountedSubTotal * (invoiceData.cGST / 100);
  //     const finalAmount = discountedSubTotal + sGstAmount + cGstAmount;

  //     doc.setFontSize(12);
  //     doc.setTextColor(33, 52, 66);
  //     doc.setLineWidth(0.2);
  //     doc.line(89, 219, 196, 219);
  //     doc.line(89, 228, 196, 228);
  //     doc.line(89, 237, 196, 237);
  //     doc.line(89, 246, 196, 246);
  //     doc.text(String(productsQty), 90, 216);
  //     doc.text(String(productsdefectiveItem), 103, 216);
  //     // doc.text('Total : ', 165, 240);
  //     doc.text(String("Rs" + ' ' + productsSubTotal.toFixed(2)), 160, 216);
  //     doc.text('Disc % :', 124, 225);
  //     doc.text(String(invoiceData.discount + "%"), 145, 225);
  //     doc.text(String("Rs" + ' ' + discountAmount.toFixed(2)), 160, 225);
  //     doc.text('S.GST % :', 120, 234);
  //     doc.text(String(invoiceData.sGST + "%"), 145, 234);
  //     doc.text(String("Rs" + ' ' + sGstAmount.toFixed(2)), 160, 234);
  //     doc.text('C.GST % :', 120, 243);
  //     doc.text(String(invoiceData.cGST + "%"), 145, 243);
  //     doc.text(String("Rs" + ' ' + cGstAmount.toFixed(2)), 160, 243);
  //     doc.setFillColor(245, 245, 245);
  //     doc.rect(117, 248, 100, 10, 'F');
  //     doc.setTextColor(0, 0, 0);
  //     doc.text("Final Amount : ", 120, 254);
  //     // doc.text(String(invoiceData.finalSubAmount)+ "Rs", 160, 255);
  //     doc.text(String("Rs" + ' ' + finalAmount.toFixed(2)), 160, 255);




  //     doc.addImage(logoimg, 'JPEG', 0, 285, 211, 15);

  //     doc.setFontSize(12);
  //     doc.setTextColor(33, 52, 66);
  //     doc.text('PAN NO :', 16, 225);
  //     doc.text(invoiceData.firmName.panNo, 35, 225);

  //     // open PDF
  //     window.open(doc.output('bloburl'));

  //   };
  // }

  // generatePDF4Download(invoiceData: any) {
  //   const doc = new jsPDF();

  //   // Add image
  //   const img = new Image();
  //   img.src = '../assets/company12.1.png';
  //   const logoimg = new Image();
  //   logoimg.src = '../assets/company12.2.png';


  //   img.onload = () => {

  //     // Add text on top of the image
  //     doc.addImage(img, 'JPEG', 0, 0, 210, 45);


  //     // DATE
  //     doc.setFontSize(15);
  //     doc.setTextColor(0, 0, 0);
  //     doc.text('Invoice :', 20, 25);
  //     doc.text(String(invoiceData.invoiceNumber), 50, 25);
  //     doc.setFontSize(15);
  //     doc.setTextColor(0, 0, 0);
  //     doc.text('Date :', 25, 33);
  //     doc.text(invoiceData.date, 50, 33);


  //     // Shop Details 
  //     doc.setFontSize(25);
  //     doc.setTextColor(255, 255, 255);
  //     doc.text(invoiceData.firmName.header, 120, 28);
  //     doc.setFontSize(10);
  //     doc.setTextColor(5, 5, 5);
  //     const addresseLines = doc.splitTextToSize(invoiceData.firmName.address, 60);
  //     let startYFirm = 75;
  //     addresseLines.forEach((line: string) => {
  //       doc.text(line, 14, startYFirm);
  //       startYFirm += 5;
  //     });
  //     doc.text('Mob No:', 14, 85);
  //     doc.text(String(invoiceData.firmName.mobileNo), 29, 85);
  //     doc.setFontSize(13);
  //     doc.setTextColor(0, 0, 0);
  //     doc.text('GST:', 14, 100);
  //     doc.text(invoiceData.firmName.gstNo, 28, 100);


  //     // Customer Details
  //     doc.setFontSize(15);
  //     doc.setTextColor(122, 122, 122);
  //     doc.text('Customer Details', 127, 62);
  //     doc.setFontSize(12);
  //     doc.setTextColor(5, 5, 5);
  //     doc.text(invoiceData.partyName.partyName, 127, 70);
  //     doc.setFontSize(10);
  //     doc.setTextColor(5, 5, 5);
  //     const addressLines = doc.splitTextToSize(invoiceData.partyName.partyAddress, 60);
  //     let startYCustomer = 75;
  //     addressLines.forEach((line: string) => {
  //       doc.text(line, 127, startYCustomer);
  //       startYCustomer += 5;
  //     });
  //     doc.text('Mob No:', 127, 85);
  //     doc.text(String(invoiceData.partyName.partyMobileNo), 142, 85);
  //     doc.setFontSize(13);
  //     doc.setTextColor(0, 0, 0);
  //     doc.text('GST:', 140, 100);
  //     doc.text(invoiceData.partyName.partyGstNo, 153, 100);


  //     // Add table
  //     const productsSubTotal = invoiceData.products.reduce((acc: any, product: any) => acc + product.finalAmount, 0);
  //     const productsQty = invoiceData.products.reduce((acc: any, product: any) => acc + product.qty, 0);
  //     const productsdefectiveItem = invoiceData.products.reduce((acc: any, product: any) => acc + product.defectiveItem, 0);

  //     const bodyRows = invoiceData.products.map((product: any, index: any) => [
  //       index + 1,
  //       product.poNumber,
  //       product.productName.productName,
  //       product.qty,
  //       product.defectiveItem,
  //       product.price,
  //       product.finalAmount,
  //     ]);

  //     // Add empty rows if there are less than 10 products
  //     while (bodyRows.length < 10) {
  //       bodyRows.push([
  //         '',
  //         '',
  //         '',
  //         '',
  //         '',
  //         '',
  //         '',
  //       ]);
  //     }
  //     (doc as any).autoTable({
  //       head: [['Sr.', 'Po Number', 'Product', 'Qty', 'Defective Item', 'Price', 'Final Amount']],
  //       body: bodyRows,
  //       startY: 105,
  //       theme: 'plain',
  //       headStyles: {
  //         fillColor: [213, 204, 195],
  //         textColor: [0, 0, 0],
  //         fontSize: 10,
  //         cellPadding: 2,
  //       },
  //       bodyStyles: {
  //         textColor: [0, 0, 0],
  //         halign: 'left',
  //         fontSize: 15,
  //       },
  //       didDrawCell: (data: any) => {
  //         const { cell, row, column } = data;
  //         if (row.section === 'body') {
  //           doc.setDrawColor(122, 122, 122);
  //           doc.setLineWidth(0.2);
  //           doc.line(cell.x, cell.y + cell.height, cell.x + cell.width, cell.y + cell.height);
  //         }

  //       }

  //     });

  //     const discountAmount = (productsSubTotal * (invoiceData.discount / 100));
  //     const discountedSubTotal = productsSubTotal - discountAmount;
  //     const sGstAmount = discountedSubTotal * (invoiceData.sGST / 100);
  //     const cGstAmount = discountedSubTotal * (invoiceData.cGST / 100);
  //     const finalAmount = discountedSubTotal + sGstAmount + cGstAmount;

  //     doc.setFontSize(12);
  //     doc.setTextColor(33, 52, 66);
  //     doc.setLineWidth(0.2);
  //     doc.line(89, 219, 196, 219);
  //     doc.line(89, 228, 196, 228);
  //     doc.line(89, 237, 196, 237);
  //     doc.line(89, 246, 196, 246);
  //     doc.text(String(productsQty), 90, 216);
  //     doc.text(String(productsdefectiveItem), 103, 216);
  //     // doc.text('Total : ', 165, 240);
  //     doc.text(String("Rs" + ' ' + productsSubTotal.toFixed(2)), 160, 216);
  //     doc.text('Disc % :', 124, 225);
  //     doc.text(String(invoiceData.discount + "%"), 145, 225);
  //     doc.text(String("Rs" + ' ' + discountAmount.toFixed(2)), 160, 225);
  //     doc.text('S.GST % :', 120, 234);
  //     doc.text(String(invoiceData.sGST + "%"), 145, 234);
  //     doc.text(String("Rs" + ' ' + sGstAmount.toFixed(2)), 160, 234);
  //     doc.text('C.GST % :', 120, 243);
  //     doc.text(String(invoiceData.cGST + "%"), 145, 243);
  //     doc.text(String("Rs" + ' ' + cGstAmount.toFixed(2)), 160, 243);
  //     doc.setFillColor(245, 245, 245);
  //     doc.rect(117, 248, 100, 10, 'F');
  //     doc.setTextColor(0, 0, 0);
  //     doc.text("Final Amount : ", 120, 254);
  //     // doc.text(String(invoiceData.finalSubAmount)+ "Rs", 160, 255);
  //     doc.text(String("Rs" + ' ' + finalAmount.toFixed(2)), 160, 255);



  //     doc.addImage(logoimg, 'JPEG', 0, 272, 211, 25);

  //     doc.setFontSize(12);
  //     doc.setTextColor(33, 52, 66);
  //     doc.text('PAN NO :', 16, 225);
  //     doc.text(invoiceData.firmName.panNo, 35, 225);

  //     // open PDF
  //     window.open(doc.output('bloburl'))

  //   };

  // }

  // generatePDF5Download(invoiceData: any) {
  //   const doc = new jsPDF();

  //   // Add image
  //   const img = new Image();
  //   img.src = '../assets/invoice4.1.png';
  //   const logoimg = new Image();
  //   logoimg.src = '../assets/invoice4.2.png';


  //   img.onload = () => {

  //     // Add text on top of the image
  //     doc.addImage(img, 'JPEG', 0, 15, 210, 25);


  //     // DATE
  //     doc.setFontSize(15);
  //     doc.setTextColor(255, 255, 255);
  //     doc.text('Invoice :', 150, 25);
  //     doc.text(String(invoiceData.invoiceNumber), 174, 25);
  //     doc.setFontSize(15);
  //     doc.setTextColor(255, 255, 255);
  //     doc.text('Date :', 155, 33);
  //     doc.text(invoiceData.date, 174, 33);


  //     // Shop Details 
  //     doc.setFontSize(25);
  //     doc.setTextColor(0, 0, 0);
  //     doc.text(invoiceData.firmName.header, 14, 28);
  //     doc.setFontSize(10);
  //     doc.setTextColor(5, 5, 5);
  //     const addresseLines = doc.splitTextToSize(invoiceData.firmName.address, 60);
  //     let startYFirm = 75;
  //     addresseLines.forEach((line: string) => {
  //       doc.text(line, 14, startYFirm);
  //       startYFirm += 5;
  //     });
  //     doc.text('Mob No:', 14, 85);
  //     doc.text(String(invoiceData.firmName.mobileNo), 29, 85);
  //     doc.setFontSize(13);
  //     doc.setTextColor(0, 0, 0);
  //     doc.text('GST:', 14, 100);
  //     doc.text(invoiceData.firmName.gstNo, 28, 100);


  //     // Customer Details
  //     doc.setFontSize(15);
  //     doc.setTextColor(122, 122, 122);
  //     doc.text('Customer Details', 127, 62);
  //     doc.setFontSize(12);
  //     doc.setTextColor(5, 5, 5);
  //     doc.text(invoiceData.partyName.partyName, 127, 70);
  //     doc.setFontSize(10);
  //     doc.setTextColor(5, 5, 5);
  //     const addressLines = doc.splitTextToSize(invoiceData.partyName.partyAddress, 60);
  //     let startYCustomer = 75;
  //     addressLines.forEach((line: string) => {
  //       doc.text(line, 127, startYCustomer);
  //       startYCustomer += 5;
  //     });
  //     doc.text('Mob No:', 127, 85);
  //     doc.text(String(invoiceData.partyName.partyMobileNo), 142, 85);
  //     doc.setFontSize(13);
  //     doc.setTextColor(0, 0, 0);
  //     doc.text('GST:', 140, 100);
  //     doc.text(invoiceData.partyName.partyGstNo, 153, 100);


  //     // Add table
  //     const productsSubTotal = invoiceData.products.reduce((acc: any, product: any) => acc + product.finalAmount, 0);
  //     const productsQty = invoiceData.products.reduce((acc: any, product: any) => acc + product.qty, 0);
  //     const productsdefectiveItem = invoiceData.products.reduce((acc: any, product: any) => acc + product.defectiveItem, 0);
  //     const bodyRows = invoiceData.products.map((product: any, index: any) => [
  //       index + 1,
  //       product.poNumber,
  //       product.productName.productName,
  //       product.qty,
  //       product.defectiveItem,
  //       product.price,
  //       product.finalAmount,
  //     ]);

  //     // Add empty rows if there are less than 10 products
  //     while (bodyRows.length < 10) {
  //       bodyRows.push([
  //         '',
  //         '',
  //         '',
  //         '',
  //         '',
  //         '',
  //         '',
  //       ]);
  //     }
  //     (doc as any).autoTable({
  //       head: [['Sr.', 'Po Number', 'Product', 'Qty', 'Defective Item', 'Price', 'Final Amount']],
  //       body: bodyRows,
  //       startY: 105,
  //       theme: 'plain',
  //       headStyles: {
  //         fillColor: [213, 204, 195],
  //         textColor: [0, 0, 0],
  //         fontSize: 10,
  //         cellPadding: 2,
  //       },
  //       bodyStyles: {
  //         textColor: [0, 0, 0],
  //         halign: 'left',
  //         fontSize: 15,
  //       },
  //       didDrawCell: (data: any) => {
  //         const { cell, row, column } = data;
  //         if (row.section === 'body') {
  //           doc.setDrawColor(122, 122, 122);
  //           doc.setLineWidth(0.2);
  //           doc.line(cell.x, cell.y + cell.height, cell.x + cell.width, cell.y + cell.height);
  //         }

  //       }

  //     });

  //     const discountAmount = (productsSubTotal * (invoiceData.discount / 100));
  //     const discountedSubTotal = productsSubTotal - discountAmount;
  //     const sGstAmount = discountedSubTotal * (invoiceData.sGST / 100);
  //     const cGstAmount = discountedSubTotal * (invoiceData.cGST / 100);
  //     const finalAmount = discountedSubTotal + sGstAmount + cGstAmount;
  //     doc.setFontSize(12);
  //     doc.setTextColor(33, 52, 66);
  //     doc.setLineWidth(0.2);
  //     doc.line(89, 219, 196, 219);
  //     doc.line(89, 228, 196, 228);
  //     doc.line(89, 237, 196, 237);
  //     doc.line(89, 246, 196, 246);
  //     doc.text(String(productsQty), 90, 216);
  //     doc.text(String(productsdefectiveItem), 103, 216);
  //     // doc.text('Total : ', 165, 240);
  //     doc.text(String("Rs" + ' ' + productsSubTotal.toFixed(2)), 160, 216);
  //     doc.text('Disc % :', 124, 225);
  //     doc.text(String(invoiceData.discount + "%"), 145, 225);
  //     doc.text(String("Rs" + ' ' + discountAmount), 160, 225);
  //     doc.text('S.GST % :', 120, 234);
  //     doc.text(String(invoiceData.sGST + "%"), 145, 234);
  //     doc.text(String("Rs" + ' ' + sGstAmount.toFixed(2)), 160, 234);
  //     doc.text('C.GST % :', 120, 243);
  //     doc.text(String(invoiceData.cGST + "%"), 145, 243);
  //     doc.text(String("Rs" + ' ' + cGstAmount.toFixed(2)), 160, 243);
  //     doc.setFillColor(245, 245, 245);
  //     doc.rect(117, 248, 100, 10, 'F');
  //     doc.setTextColor(0, 0, 0);
  //     doc.text("Final Amount : ", 120, 254);
  //     // doc.text(String(invoiceData.finalSubAmount)+ "Rs", 160, 255);
  //     doc.text(String("Rs" + ' ' + finalAmount.toFixed(2)), 160, 255);


  //     doc.addImage(logoimg, 'JPEG', 0, 272, 211, 25);

  //     doc.setFontSize(12);
  //     doc.setTextColor(33, 52, 66);
  //     doc.text('PAN NO :', 16, 225);
  //     doc.text(invoiceData.firmName.panNo, 35, 225);

  //     // open PDF
  //     window.open(doc.output('bloburl'))

  //   };

  // }
}
