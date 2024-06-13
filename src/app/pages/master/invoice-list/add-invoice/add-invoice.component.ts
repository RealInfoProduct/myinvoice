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

    this.firebaseService.addInvoice(payload).then((res) => {
      if (res) {
          this.openConfigSnackBar('record create successfully')
        }
    } , (error) => {
      this.openConfigSnackBar(error.error.error.message)
      
    })

    console.log("payload==========>>", payload);

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
