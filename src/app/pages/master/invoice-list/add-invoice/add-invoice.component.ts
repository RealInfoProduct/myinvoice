import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { log } from 'console';
import moment from 'moment';
import { InvoiceList } from 'src/app/interface/invoice';
import { FirebaseService } from 'src/app/services/firebase.service';
import { LoaderService } from 'src/app/services/loader.service';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
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
}

interface Product {
  productName: string;
  price: number;
  qty: number;
  defectiveItem: number;
  poNumber: number;
  finalAmount: number;
}

interface firebaseData {
  firmName: any;
  partyName: any;
  date: string;
  discount: number;
  sGST: number;
  cGST: number;
  product: Product[];
  invoiceNumber : number,
  accountYear : any
}


@Component({
  selector: 'app-add-invoice',
  templateUrl: './add-invoice.component.html',
  styleUrls: ['./add-invoice.component.scss']
})
export class AddInvoiceComponent implements OnInit {
  @ViewChild(MatTable, { static: true }) table: MatTable<any> = Object.create(null);
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
  demo: any
  productList: any = []
  firmList: any = []
  dataSource = new MatTableDataSource(this.data);
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator = Object.create(null);



  constructor(
    private fb: FormBuilder,
    private firebaseService: FirebaseService,
    private loaderService: LoaderService,
    private _snackBar: MatSnackBar,
  ) { }
  ngOnInit(): void {
    this.buildForm()
    this.getProductList()
    this.getPartyList()
    this.getFirmList()


  }

  buildForm() {
    this.invoiceForm = this.fb.group({
      firm: ['', Validators.required],
      party: ['', Validators.required],
      discount: ['', Validators.required],
      sGST: ['', Validators.required],
      cGST: ['', Validators.required],
      date: [new Date()],
      totalitem: ['', Validators.required],
      defectiveitem: ['', Validators.required],
      price: ['', Validators.required],
      product: ['', Validators.required],
      poNumber: ['', Validators.required],
    })
  }
  addData(): void {
    if (this.invoiceForm.valid) {
      const addtoData: InvoiceData = {
        id: this.nextId++,
        ...this.invoiceForm.value
      };
      addtoData.finalAmount = this.calculateProductTotal(addtoData)
      addtoData.date = moment(this.invoiceForm.value.date).format('L');
      this.data.push(addtoData);
      this.dataSource.data = [...this.data];
      this.invoiceForm.controls['product'].reset()
      this.invoiceForm.controls['defectiveitem'].reset()
      this.invoiceForm.controls['poNumber'].reset()
      this.invoiceForm.controls['price'].reset()
      this.invoiceForm.controls['totalitem'].reset()
      this.editMode = false;
    }

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
    this.dataSource.data = [...this.data];
  }
  updateData() {
    if (this.invoiceForm.valid) {
      const updatedData = { id: this.currentEditId, ...this.invoiceForm.value };
      updatedData.finalAmount = this.calculateProductTotal(updatedData)
      updatedData.date = moment(this.invoiceForm.value.date).format('L');
      this.data.push(updatedData);
      this.dataSource.data = [...this.data];
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
    this.dataSource.data = [...this.data];
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
    const netItems = productData.totalitem - productData.defectiveitem;
    const baseAmount = netItems * productData.price;
    const discountAmount = (productData.discount / 100) * baseAmount;
    const discountedAmount = baseAmount - discountAmount;
    const sGSTAmount = (productData.sGST / 100) * discountedAmount;
    const cGSTAmount = (productData.cGST / 100) * discountedAmount;
    const finalAmount = discountedAmount + sGSTAmount + cGSTAmount;
    return finalAmount;
  }

  selectedIndex: number = 0;
  goToNextTab(): void {
    this.selectedIndex = (this.selectedIndex + 1) % 3; // Assuming there are 3 tabs
  }

  generateInvoice(){
    const invoiceData = this.transformData(this.data)
    const payload: InvoiceList = {
      id : '',
      accountYear: invoiceData[0].accountYear,
      cGST: invoiceData[0].cGST,
      date: invoiceData[0].date,
      discount: invoiceData[0].discount,
      invoiceNumber: 0,
      sGST: invoiceData[0].sGST,
      firmName: invoiceData[0].firmName,
      partyName: invoiceData[0].partyName,
      products: invoiceData[0].product      
    }

    // this.firebaseService.addInvoice(payload).then((res) => {
    //   if (res) {
    //       this.openConfigSnackBar('record create successfully')
    //     }
    // } , (error) => {
    //   this.openConfigSnackBar(error.error.error.message)
      
    // })

    console.log("payload==========>>", payload);
    this.generatePDF(payload)

  }
  generatePDF(data :any){
    console.log("data==========>>", data);

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
      doc.text('Invoice:', 155, 18);
      doc.text('1001', 175, 18);
      doc.setFontSize(16);
      doc.setTextColor(5, 5, 5);
      doc.text('Date:', 161, 27);
      doc.text('16/05/2024', 175, 27);
   

      //       // Shop Details

      doc.setFontSize(25);
      doc.setTextColor(255, 255, 255);
      doc.text('Ramesh G.Raiyani', 20, 17);
      doc.setFontSize(10);
      doc.setTextColor(5, 5, 5);
      doc.text('93,Charnunda Nagar Society', 15, 55);
      doc.text('Punagam, Surat', 15, 60);
      doc.text('Mob No:-', 15, 65);
      doc.text('1234567890', 30, 65);


      //  //  Customer Details
      doc.setFontSize(15);
      doc.setTextColor(122, 122, 122);
      doc.text('Customer Details', 140, 45);
      doc.setFontSize(12);
      doc.setTextColor(5, 5, 5);
      doc.text('ROYAL ZENITH PRINTS PVT LTD.', 140, 55);
      doc.setFontSize(10);
      doc.setTextColor(5, 5, 5);
      doc.text('537, 5th FLOOR,CARPARKING,', 140, 60);
      doc.text('SURAT TEXTILE MARKET', 140, 65);
      doc.text('Mob No :-', 140, 70);
      doc.text('1234567890', 157, 70);
      doc.text('GST :-', 145, 75);
      doc.text('ADS74636', 157, 75);


      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text('Product Details', 15, 90);


      // Add table
      const data = [
        ['1', 'demo','1', '5', '2', '20', '100'],
        ['2', 'demo','2', '5', '2', '20', '100'],
        ['3', 'demo','3', '5', '2', '20', '100'],
        ['4', 'demo','4', '5', '2', '20', '100'],
        ['5', 'demo','5', '5', '2', '20', '100'],
        ['6', 'demo','6', '5', '2', '20', '100'],
        ['7', 'demo','1', '5', '2', '20', '100'],
        ['8', 'demo','2', '5', '2', '20', '100'],
        ['9', 'demo','3', '5', '2', '20', '100'],
        ['10', 'demo','4', '5', '2', '20', '100'],
        ['11', 'demo','5', '5', '2', '20', '100'],
        ['12', 'demo','6', '5', '2', '20', '100'],
        ['13', 'demo','1', '5', '2', '20', '100'],
        ['14', 'demo','2', '5', '2', '20', '100'],
        ['15', 'demo','3', '5', '2', '20', '100'],
        ['16', 'demo','4', '5', '2', '20', '100'],

      ];
      const bodyRows: any = [];
      data.forEach((row) => {
        bodyRows.push(row.map(cell => ({ content: cell, styles: { textColor: [0, 0, 0], fontSize: 10 } })));
      });
      (doc as any).autoTable({
        head: [['Sr.', 'product','Po Number', 'Qty', 'Defective Item', 'Price', 'Final Amount']],
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
          halign: 'center',
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
      doc.text('Total:', 161, 240);
      doc.text('0', 175, 240);
      doc.text('Discount:', 154, 246);
      doc.text('0', 175, 246);
      doc.text('SGST:', 159, 252);
      doc.text('0', 175, 252);
      doc.text('CGST:', 159, 258);
      doc.text('0', 175, 258);
      doc.setFillColor(245, 245, 245);
      doc.rect(142, 261, 90, 10, 'F');
      doc.setTextColor(0, 0, 0);
      doc.text('Final Amount :', 145, 268);
      doc.text('0', 175, 268);

      // PAN NO
      doc.setFontSize(12);
      doc.setTextColor(33, 52, 66);
      doc.text('PAN NO :', 16, 240);
      doc.text('AU74748AS', 35, 240);

      // GSTIN
      doc.setFontSize(12);
      doc.setTextColor(33, 52, 66);
      doc.text('GSTIN :', 16, 247);
      doc.text('AU74748AS', 35, 247);

      // open PDF
      window.open(doc.output('bloburl'))
    }
  }

  transformData(myData: any[]): firebaseData[] {

    const result: firebaseData[] = [];
  
    myData.forEach(item => {
      const existingEntryIndex = result.findIndex(entry =>
        entry.firmName === item.firm.header &&
        entry.partyName === item.party.partyName &&
        entry.date === item.date &&
        entry.discount === item.discount &&
        entry.sGST === item.sGST &&
        entry.cGST === item.cGST
      );
  
      const product = {
        productName: item.product,
        price: item.price,
        qty: item.totalitem,
        defectiveItem: item.defectiveitem,
        poNumber: item.poNumber,
        finalAmount: item.finalAmount
      };
  
      if (existingEntryIndex !== -1) {
        // If entry already exists, push the product to its existing product array
        result[existingEntryIndex].product.push(product);
      } else {
        // If entry doesn't exist, create a new entry with an array containing the product
        result.push({
          firmName: item.firm.header,
          partyName: item.party.partyName,
          date: item.date,
          discount: item.discount,
          sGST: item.sGST,
          cGST: item.cGST,
          invoiceNumber: 0,
          accountYear: localStorage.getItem('accountYear'),
          product: [product]
        });
      }
    });
  
    return result;
  }

  openConfigSnackBar(snackbarTitle: any) {
    this._snackBar.open(snackbarTitle, 'Splash', {
      duration: 2 * 1000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }
  
  
}

