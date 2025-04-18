import { Component, Inject, OnInit, Optional, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { ProductList, PurchaseList } from 'src/app/interface/invoice';
import { FirebaseService } from 'src/app/services/firebase.service';
import { LoaderService } from 'src/app/services/loader.service';
import { productMasterDialogComponent } from '../product-master/product-master.component';
import { BarcodeStickerComponent } from '../barcode-sticker/barcode-sticker.component';

@Component({
  selector: 'app-purchase-master',
  templateUrl: './purchase-master.component.html',
  styleUrls: ['./purchase-master.component.scss']
})
export class PurchaseMasterComponent {
  displayedColumns: string[] = [
    'srno',
    'ProductName',
    'productDes',
    'shellAmount',
    'productSize',
    'action',
  ];
  productList :any = []
  purchaseList :any = []
  nextUniqueNumber :number = 0
  editRecode :any
  productForm: FormGroup;
  purchaseDataSource = new MatTableDataSource(this.purchaseList);
  @ViewChild(MatTable, { static: true }) table: MatTable<any> = Object.create(null);
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator = Object.create(null);

  constructor(private dialog: MatDialog , 
    private firebaseService : FirebaseService ,
    private loaderService : LoaderService,
    private fb: FormBuilder,
    private _snackBar: MatSnackBar,) { }


  ngOnInit(): void {
  this.buildForm()
  this.getPurchaseList()
  this.getProductList()
  }

  buildForm() {
    this.productForm = this.fb.group({
      productid: [''],
      productDes: [''],
      productDate: [new Date()],
      purchaseAmount: [''],
      shellAmount: [''],
      productSize: [''],
    })
  }

  applyFilter(filterValue: string): void {
    this.purchaseDataSource.filter = filterValue.trim().toLowerCase();
  }

  addPurchase(){
    const payload: PurchaseList = {
      id: this.editRecode?.id || '',
      userId: localStorage.getItem("userId"),
      productUniqueNumber: this.editRecode?.productUniqueNumber || this.nextUniqueNumber,
      productid: this.productForm.value.productid.id,
      productDes: this.productForm.value.productDes,
      productDate: this.productForm.value.productDate,
      productSize: this.productForm.value.productSize,
      purchaseAmount: this.productForm.value.purchaseAmount,
      shellDiscount: this.editRecode?.shellDiscount || 0,
      shellAmount: this.productForm.value.shellAmount,
      productProfit: this.editRecode?.productProfit || 0,
      customerName: this.editRecode?.customerName || '',
      customerNumber: this.editRecode?.customerNumber || 0,
      finalAmount: this.editRecode?.finalAmount || 0,
      createDate: this.editRecode?.createDate || new Date(),
      isShell: this.editRecode?.isShell || false,
      invoiceNo: 0,
      invoiceDate: '',
      firmName: '',
      firmAddress: '',
      invoiceStatus: ''
    }
    console.log(payload);
    
    if (payload.id) {
      this.firebaseService.updatePurchase(payload.id, payload).then((res: any) => {
        this.getProductList()
        this.openConfigSnackBar('record update successfully')
        this.productForm.reset()
        this.productForm.controls['productDate'].setValue(new Date())
      }, (error) => {
        console.log("error => ", error);
  
      })
    } else {
      this.firebaseService.addPurchase(payload).then((res) => {
        if (res) {
            this.getPurchaseList()
            this.openConfigSnackBar('record create successfully')
            this.productForm.reset()
            this.productForm.controls['productDate'].setValue(new Date())
          }
      } , (error) => {
        console.log("error=>" , error);
      })
    }
  }

  getPurchaseList() {
    this.loaderService.setLoader(true);
    this.firebaseService.getAllPurchase().subscribe((res: any) => {
      if (res) {
        this.purchaseList = res.filter((item: any) => item.userId === localStorage.getItem("userId"));
        this.purchaseList.sort((a: any, b: any) => {
          const aTime = a.createDate?.seconds || 0;
          const bTime = b.createDate?.seconds || 0;
          return bTime - aTime;
        });
        const productUniqueNumbers = this.purchaseList.map((item: any) => item.productUniqueNumber);
        const maxUniqueNumber = productUniqueNumbers.length ? Math.max(...productUniqueNumbers) : 0;
        this.nextUniqueNumber = maxUniqueNumber + 1;            
        this.purchaseDataSource = new MatTableDataSource(this.purchaseList);
        this.purchaseDataSource.paginator = this.paginator;
        this.loaderService.setLoader(false);
      }
    });
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

  openConfigSnackBar(snackbarTitle: any) {
    this._snackBar.open(snackbarTitle, 'Splash', {
      duration: 2 * 1000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }

  getProductName(productid:string){
    return this.productList.find((id:any) => id.id === productid)?.productName
  }

  setValue(element :any){
 
    this.editRecode = element
    this.productForm.patchValue({
      productid: this.productList.find((id:any) => id.id === element.productid) || '',
      productDes: element.productDes || '',
      productDate: element.productDate?.seconds ? new Date(element.productDate.seconds * 1000) : new Date(),
      purchaseAmount: element.purchaseAmount || '',
      shellAmount: element.shellAmount || '',
      productSize: element.productSize || '',
    });
  }

  deleterecode(element :any ){
    console.log('element==>>' , element);
    
    element.action = 'Delete';
    element.isPurchase = true;
    const dialogRef = this.dialog.open(productMasterDialogComponent, { data: element });

    dialogRef.afterClosed().subscribe((result) => {
      this.firebaseService.deletePurchase(result.data.id).then((res:any) => {
        this.getPurchaseList()
        this.openConfigSnackBar('record delete successfully')
    }, (error) => {
      console.log("error => " , error);
      
    })
      
    })
  }

  cerateQrCode(enterAnimationDuration: string, exitAnimationDuration: string , element:any): void {
   const productName =  this.getProductName(element.productid)
   element['productName'] = productName
    this.dialog.open(BarcodeStickerComponent, {
      enterAnimationDuration,
      exitAnimationDuration,
      data: element,
    });
  }
}