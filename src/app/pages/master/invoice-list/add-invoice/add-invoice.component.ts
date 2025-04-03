import { Component,  OnInit, ViewChild, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import moment from 'moment';
import { InvoiceList } from 'src/app/interface/invoice';
import { FirebaseService } from 'src/app/services/firebase.service';
import { LoaderService } from 'src/app/services/loader.service';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { DomSanitizer } from '@angular/platform-browser';
import { PdfviewComponent } from './pdfview/pdfview.component';
import { MatDialog } from '@angular/material/dialog';

export interface InvoiceData {
  id: number;
  firm: string;
  party: string;
  discount: number;
  sGST: number;
  cGST: number;
  date: string;
  totalitem: number;
  price: number;
  product: number;
  defectiveitem: number;
  finalAmount: number;
  poNumber: number;
  finalSubAmount: number;

  }
  
  @Component({
    selector: 'app-add-invoice',
    templateUrl: './add-invoice.component.html',
    styleUrls: ['./add-invoice.component.scss']
    })
    export class AddInvoiceComponent implements OnInit {
      @ViewChild(MatTable, { static: true }) table: MatTable<any> = Object.create(null);
      @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator = Object.create(null);
  data: InvoiceData[] = [];
  displayedColumns: string[] = [
    '#',
    'firm',
    'Party',
    'PoNumber',
    'product',
    'TotalItem',
    'Price',
    'Defectiveitem',
    'FinalAmount',
    'action',
  ];
  partyList: any;
  invoiceForm: FormGroup
  editMode = false;
  nextId: number = 1;
  currentEditId: number

  productList: any = []
  firmList: any = []
  invoiceList: any = []
  maxInvoiceNumber: number = 0
  blobUrl :any
  addinvoiceDataSource = new MatTableDataSource(this.data);
  selectedIndex: number = 0;
  paymentDays = new Date()
  readonly dialog = inject(MatDialog);
 
  constructor(
    private fb: FormBuilder,
    private firebaseService: FirebaseService,
    private loaderService: LoaderService,
    private sanitizer: DomSanitizer,
    private _snackBar: MatSnackBar,
    ) { }
    
  ngOnInit(): void {
    this.buildForm()
    this.getPartyList()
    this.getProductList()
    this.getFirmList()
    this.addinvoiceDataSource.paginator = this.paginator;
    if (this.loaderService.getInvoiceData()) {
      const getInvoiceData  = this.loaderService.getInvoiceData()
        this.invoiceForm.setValue({
          firm: '',
          party: '',
          discount: getInvoiceData.discount || 0,
          sGST: getInvoiceData.sGST || 2.5,
          cGST: getInvoiceData.cGST || 2.5,
          date: new Date(getInvoiceData.date) || new Date(),
          totalitem: getInvoiceData.products[0].qty || 0,
          defectiveitem: getInvoiceData.products[0].defectiveItem || 0,
          price: getInvoiceData.products[0].price || 0,
          product: getInvoiceData.products[0].productName || '',
          poNumber: getInvoiceData.products[0].poNumber || 0,
          paymentDays:getInvoiceData.paymentDays || 30
        });
      ['firm', 'party','product', 'defectiveitem', 'poNumber', 'price', 'totalitem'].forEach(control => {
        this.invoiceForm.controls[control].reset();
      })
      } 
  }

  buildForm() {
    this.invoiceForm = this.fb.group({
      firm: ['', Validators.required],
      party: ['', Validators.required],
      discount: [0, [Validators.required,Validators.min(0),Validators.max(100)]],
      sGST: [2.5,[Validators.required,Validators.min(0),Validators.max(100)]],
      cGST: [2.5,[Validators.required,Validators.min(0),Validators.max(100)]],
      date: [new Date()],
      totalitem: ['', [Validators.required,Validators.min(0)]],
      defectiveitem: [0, [Validators.required,Validators.min(0)]],
      price: ['',[Validators.required,Validators.min(0)]],
      product: ['', Validators.required],
      poNumber: ['', [Validators.required, Validators.min(0)]],
      paymentDays: [30]
    })
    this.paymentDaysChange(30)
    }
    
  addData(): void {
   
    if (this.invoiceForm.valid) {
      const addtoData: InvoiceData = {
        id: this.nextId++,
        ...this.invoiceForm.value
      };
      addtoData.finalAmount = this.calculateProductTotal(addtoData)
      // addtoData.finalSubAmount = this.calculateSubTotal(addtoData)
      addtoData.date = moment(this.invoiceForm.value.date).format('L');
      this.data.push(addtoData);
      this.addinvoiceDataSource.data = [...this.data];
      ['product', 'defectiveitem', 'poNumber', 'price', 'totalitem'].forEach(control => {
        this.invoiceForm.controls[control].reset();
      })
      this.editMode = false;
    }
      
  }

  openPdfViewDialog(pdfViewData?: any) {
    const dialogRef = this.dialog.open(PdfviewComponent , {
      width: '100%',
      height : '100%',
      data: pdfViewData
    });
    dialogRef.afterClosed().subscribe(result => {
     
    });
    
  }

  edit(element: any) {
    this.editMode = true;
    this.currentEditId = element.id;
    this.invoiceForm.patchValue({
      firm: element.firm,
      party: element.party,
      discount: element.discount,
      sGST: element.sGST,
      cGST: element.cGST,
      date: new Date(element.date),
      totalitem: element.totalitem,
      product: element.product,
      defectiveitem: element.defectiveitem,
      price: element.price,
      poNumber: element.poNumber
    });
    this.data = this.data.filter(item => item.id !== element.id);
    this.addinvoiceDataSource.data = [...this.data];
    }
    
  updateData() {
    if (this.invoiceForm.valid) {
      const updatedData = { id: this.currentEditId, ...this.invoiceForm.value };
      updatedData.finalAmount = this.calculateProductTotal(updatedData)
      // updatedData.finalSubAmount = this.calculateSubTotal(updatedData)
      updatedData.date = moment(this.invoiceForm.value.date).format('L');
      this.data.push(updatedData);
      this.addinvoiceDataSource.data = [...this.data];
      this.invoiceForm.controls['product'].reset()
      this.invoiceForm.controls['defectiveitem'].reset()
      this.invoiceForm.controls['poNumber'].reset()
      this.invoiceForm.controls['price'].reset()
      this.invoiceForm.controls['totalitem'].reset()
      this.editMode = false;
    }
    }
    
  deletedata(id: number) {
    this.data = this.data.filter(item => item.id !== id);
    this.addinvoiceDataSource.data = [...this.data];
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
    
  getProductList() {
    this.loaderService.setLoader(true)
    this.firebaseService.getAllProduct().subscribe((res: any) => {
      if (res) {
        this.productList = res.filter((id: any) => id.userId === localStorage.getItem("userId"))
        this.loaderService.setLoader(false)
      }
    })
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
    
  calculateProductTotal(productData: any): number {
    return (productData.totalitem - productData.defectiveitem) * (productData.price)
    }
    
  calculateSubTotal(productData: any): number {
    const netItems = productData.products.reduce((acc: number, product: any) => acc + product.qty - product.defectiveItem, 0);
    const baseAmount = productData.products.reduce((acc: number, product: any) => acc + (product.qty - product.defectiveItem) * product.price, 0);
    const discountAmount = (productData.discount / 100) * baseAmount;
    const discountedAmount = baseAmount - discountAmount;
    const sGSTAmount = (productData.sGST / 100) * discountedAmount;
    const cGSTAmount = (productData.cGST / 100) * discountedAmount;
    const finalSubAmount = discountedAmount + sGSTAmount + cGSTAmount;
    return Math.round(finalSubAmount);
}

  goToNextTab(): void {
    this.selectedIndex = (this.selectedIndex + 1) % 3; // Assuming there are 3 tabs
  }
  
    generateInvoice() {
      const invoiceData = this.transformInvoiceList(this.data);
      const finalSubAmount = this.calculateSubTotal(invoiceData);

      const partyData = this.getPartyName(invoiceData.partyId);
      const firmData = this.getFirmHeader(invoiceData.firmId);

   
      const paymentDays = 30;

      
      const invoiceDate = new Date(invoiceData.date);
      const dueDate = new Date(invoiceDate);
      dueDate.setDate(invoiceDate.getDate() + paymentDays);

      const payload: any = {
        id: '',
        accountYear: invoiceData.accountYear,
        cGST: invoiceData.cGST,
        date: invoiceData.date,
        discount: invoiceData.discount,
        invoiceNumber: invoiceData.invoiceNumber,
        sGST: invoiceData.sGST,
        firmId: invoiceData.firmId,
        partyId: invoiceData.partyId,
        products: invoiceData.products,
        userId: localStorage.getItem("userId"),
        finalSubAmount: finalSubAmount,
        isPayment: false,
        receivePayment: [],
        dueDate: dueDate.toISOString().split('T')[0] 
      };

      // this.openPdfViewDialog(payload)  
      payload['firmName'] = firmData;
      payload['partyName'] = partyData;

      this.loaderService.setInvoiceData(payload);
    }

    
    getPartyName(partyId: string) {
      return this.partyList.find((obj: any) => obj.id === partyId) ?? ''
    }

    getFirmHeader(firmId: string) {
      return this.firmList.find((obj: any) => obj.id === firmId) ?? ''
    }


  transformInvoiceList(invoiceList: any[]): any {
    if (!invoiceList.length) return {};

    // Initialize the single object with common fields from the first invoice
    const transformedObject :any = {
      // firmName: invoiceList[0].firm,
      firmId: invoiceList[0].firm.id,
      partyId: invoiceList[0].party.id,
      // partyName: invoiceList[0].party,
      date: invoiceList[0].date,
      discount: invoiceList[0].discount,
      sGST: invoiceList[0].sGST,
      cGST: invoiceList[0].cGST,
      invoiceNumber: this.maxInvoiceNumber,
      accountYear: localStorage.getItem('accountYear'),
      finalSubAmount: invoiceList[0].finalSubAmount,
      products: []
    };

    // Loop through the invoices to accumulate all products
    invoiceList.forEach((item :any) => {
      const product = {
        productName: item.product,
        price: item.price,
        qty: item.totalitem,
        defectiveItem: item.defectiveitem,
        poNumber: item.poNumber,
        finalAmount: item.finalAmount
      };

      transformedObject.products.push(product);
    });

    return transformedObject;
  }

  openConfigSnackBar(snackbarTitle: any) {
    this._snackBar.open(snackbarTitle, 'Splash', {
      duration: 2 * 1000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }

  getInvoiceList(firmId:any) {
    this.loaderService.setLoader(true)
    this.firebaseService.getAllInvoice().subscribe((res: any) => {
      if (res) {
        this.invoiceList = res.filter((id:any) => 
          id.userId === localStorage.getItem("userId") && 
          id.accountYear === localStorage.getItem("accountYear") &&
          id.firmId === firmId
         )     
        this.maxInvoiceNumber = this.invoiceList.length > 0 
        ? Math.max(...this.invoiceList.map((invoice: any) => invoice.invoiceNumber)) + 1 
        : 1;
        this.loaderService.setLoader(false)
      }
    })
    }
    
  seletedFirm(event :any){
    this.getInvoiceList(event.value.id)    
    }
    
  seletedParty(event: any) {
    if (event.value.isFirm) {
      this.invoiceForm.controls['firm'].setValue(this.firmList.find((id: any) => id.id === event.value.isFirm))
      this.getInvoiceList(event.value.isFirm)
    } else {
      this.invoiceForm.controls['firm'].reset()
      this.maxInvoiceNumber = 0
    }
  }
  
  submitInvoice(){
    const invoiceData = this.transformInvoiceList(this.data)  
    const finalSubAmount = this.calculateSubTotal(invoiceData)
    const payload: InvoiceList = {
      id : '',
      accountYear: invoiceData.accountYear,
      cGST: invoiceData.cGST,
      date: invoiceData.date,
      discount: invoiceData.discount,
      invoiceNumber: invoiceData.invoiceNumber,
      sGST: invoiceData.sGST,
      firmId: invoiceData.firmId,
      partyId: invoiceData.partyId,
      products: invoiceData.products  ,
      userId : localStorage.getItem("userId"),
      finalSubAmount : finalSubAmount,
      paymentDays : invoiceData.paymentDays,
      isPayment : false,
      receivePayment : []
    }
    
    this.firebaseService.addInvoice(payload).then((res) => {
      if (res) {
          this.openConfigSnackBar('record create successfully')
          this.generatePDF(payload)
          this.invoiceForm.reset()
          this.data = []
        }
    } , (error) => {
      this.openConfigSnackBar(error.error.error.message)
      
    })

  }


  generatePDF(invoiceData: any) {
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
      doc.text(invoiceData?.firmName?.header, 15, 17);
      doc.setFontSize(10);
      doc.setTextColor(5, 5, 5);
      const addresseLines = doc.splitTextToSize(invoiceData?.firmName?.address, 60);
      let startYFirm = 60;
      addresseLines.forEach((line: string) => {
        doc.text(line, 15, startYFirm);
        startYFirm += 5;
      });
      doc.text('Mob No:', 15, 70);
      doc.text(String(invoiceData?.firmName?.mobileNo), 30, 70);
      doc.setFontSize(13);
      doc.setTextColor(0, 0, 0);
      doc.text('GST:', 14, 90);
      doc.text(invoiceData?.firmName?.gstNo, 28, 90);


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
    // doc.text('Total : ', 165, 240);
    doc.text(String("Rs"+' ' + productsSubTotal.toFixed(2)), 160, 207);
    doc.text('Disc % :', 124, 215);
    doc.text(String(invoiceData.discount), 145, 215);
    doc.text(String("Rs"+' ' + discountAmount.toFixed(2)) , 160, 215);
    doc.text('S.GST % :', 120, 224);
    doc.text(String(invoiceData.sGST), 145, 224);
    doc.text(String("Rs"+' ' + sGstAmount.toFixed(2)) , 160, 224);
    doc.text('C.GST % :', 120, 234);
    doc.text(String(invoiceData.cGST), 145, 234);
    doc.text(String("Rs"+' ' + cGstAmount.toFixed(2)) , 160, 234);
    doc.setFillColor(245, 245, 245);
    doc.rect(117, 238, 100, 10, 'F');
    doc.setTextColor(0, 0, 0);
    doc.text("Final Amount : ", 120, 244);
    // doc.text(String(invoiceData.finalSubAmount)+ "Rs", 160, 244);
    doc.text(String("Rs"+' ' + finalAmount.toFixed(2)), 160, 244);


      // PAN NO
      doc.setFontSize(12);
      doc.setTextColor(33, 52, 66);
      doc.text('PAN NO :', 16, 215);
      doc.text(invoiceData?.firmName?.panNo, 35, 215);

      // open PDF
      window.open(doc.output('bloburl'))
    }
    }
    
    paymentDaysChange(value: any) {
      let date = this.invoiceForm.get('date')?.value;
      if (date) {
        const dateValue = new Date(date);
        dateValue.setDate(dateValue.getDate() + (value ?? this.invoiceForm.get('paymentDays')?.value ?? 30));

        this.paymentDays = dateValue;
      }
    }

}

