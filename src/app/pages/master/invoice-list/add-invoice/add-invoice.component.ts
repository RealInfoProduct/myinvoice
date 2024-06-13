import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { log } from 'console';
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
  defectiveitem:number;
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
    'Discount',
    'SGST',
    'CGST',
    'Date',
    'TotalItem',
    'Price',
    'product',
    'action',
  ];
  partyList:any;
  invoiceForm:FormGroup
  editMode = false;
  nextId: number = 1;
  currentEditId: number 
  demo:any
  productList :any = []
  firmList:any = []
dataSource = new MatTableDataSource(this.data);
@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator = Object.create(null);

 

  constructor( 
    private fb: FormBuilder,
    private firebaseService : FirebaseService , 
    private loaderService : LoaderService,

  ){}
  ngOnInit(): void {
    this.buildForm()
    this.getProductList()
    this.getPartyList()
    this.getFirmList()


  }
 
  buildForm() {
    this.invoiceForm = this.fb.group({
      firm:['',Validators.required],
      party:['',Validators.required],
      discount: ['',Validators.required],
      sGST: ['',Validators.required],
      cGST: ['',Validators.required],
      date: [new Date()] ,
      totalitem: ['',Validators.required],
      defectiveitem: ['',Validators.required],
      price: ['',Validators.required],
      product: ['',Validators.required],
    })
  }
  addData(): void {
    if (this.invoiceForm.valid) {
      const addtoData: InvoiceData = {
        id: this.nextId++,
        ...this.invoiceForm.value
      };
      this.data.push(addtoData);
      this.dataSource.data = [...this.data];
      this.invoiceForm.reset();
      this.editMode = false;
    }
  }
 
  edit(element: any) {
    this.editMode=true;
    this.currentEditId = element.id;
    this.invoiceForm.patchValue({
      firm: element.firm,
      party: element.party,
      discount: element.discount,
      sGST: element.sGST,
      cGST: element.cGST,
      date: element.date,
      totalitem: element.totalitem,
      product: element.product,
      defectiveitem: element.defectiveitem,
      price: element.price
    });
  }
  updateData() {
    if (this.invoiceForm.valid) {
      const updatedData = { id: this.currentEditId, ...this.invoiceForm.value };
      const index = this.data.findIndex(item => item.id === this.currentEditId);
      if (index !== -1) {
        this.data[index] = updatedData;
        this.dataSource.data = [...this.data];
        this.table.renderRows();
        this.invoiceForm.reset();
        this.editMode = false;
      }
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
        this.productList = res.filter((id:any) => id.userId === localStorage.getItem("userId"))
        this.loaderService.setLoader(false)
      }
    })
  }

  getFirmList() {
    this.loaderService.setLoader(true)
    this.firebaseService.getAllFirm().subscribe((res: any) => {
      if (res) {
        this.firmList = res.filter((id:any) => id.userId === localStorage.getItem("userId"))
        this.loaderService.setLoader(false)
      }
    })
  }
}
