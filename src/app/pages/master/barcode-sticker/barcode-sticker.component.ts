import { Component, Inject, Input, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import JsBarcode from 'jsbarcode';

@Component({
  selector: 'app-barcode-sticker',
  templateUrl: './barcode-sticker.component.html',
  styleUrls: ['./barcode-sticker.component.scss']
})
export class BarcodeStickerComponent {

  barcodeValue: any
  productData: any

  constructor(public dialogRef: MatDialogRef<BarcodeStickerComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any) {
    this.barcodeValue = data.id
    this.productData = data    
  }

  ngAfterViewInit() {
    JsBarcode("#barcode", this.barcodeValue, {
      format: 'CODE128',
      width: 1,
      height:40,
      displayValue: false,
    });
  }


  // printBarcode() {
  //   const printContents = document.getElementById('print-section')?.innerHTML;
  
  //   if (printContents) {
  //     const width = window.screen.width;
  //     const height = window.screen.height;
  
  //     const popupWin = window.open('', '_blank', `width=${width},height=${height},top=0,left=0`);
  
  //     if (popupWin) {
  //       popupWin.document.open();
  //       popupWin.document.write(`
  //         <html>
  //           <head>
  //             <title>Print Barcode</title>
  //             <style>
  //               body {
  //                 margin: 0;
  //                 padding: 20px;
  //                 text-align: center;
  //                 font-size: 18px;
  //                 font-family: Arial, sans-serif;
  //               }
  //               svg {
  //                 width: 100%;
  //                 height: auto;
  //               }
  //             </style>
  //           </head>
  //           <body onload="window.print(); window.close();">
  //             ${printContents}
  //           </body>
  //         </html>
  //       `);
  //       popupWin.document.close();
  //     }
  //   } else {
  //     console.error('Barcode content not found for printing.');
  //   }
  // }

  printBarcode() {
    const printSection = document.getElementById('print-section');
    const printContents = printSection ? printSection.outerHTML : '';
  
    if (printContents) {
      const width = window.screen.width;
      const height = window.screen.height;
  
      const popupWin = window.open('', '_blank', `width=${width},height=${height},top=0,left=0`);
      if (popupWin) {
        popupWin.document.open();
        popupWin.document.write(`
          <html>
            <head>
              <title>Print Barcode</title>
              <style>
                body {
                  margin: 0;
                  padding: 20px;
                  text-align: center;
                  font-size: 28px;
                  font-family: Arial, sans-serif;
                }
                svg {
                  width: 100%;
                  height: auto;
                }
              </style>
            </head>
            <body>
              ${printContents}
              <script>
                setTimeout(function() {
                  window.print();
                  window.close();
                }, 500);
              </script>
            </body>
          </html>
        `);
        popupWin.document.close();
      }
    } else {
      console.error('Barcode content not found for printing.');
    }
  }
  
}
