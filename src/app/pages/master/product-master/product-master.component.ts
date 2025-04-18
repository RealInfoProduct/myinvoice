import { Component, Inject, OnInit, Optional, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { ProductList } from 'src/app/interface/invoice';
import { FirebaseService } from 'src/app/services/firebase.service';
import { LoaderService } from 'src/app/services/loader.service';

@Component({
  selector: 'app-product-master',
  templateUrl: './product-master.component.html',
  styleUrls: ['./product-master.component.scss']
})
export class ProductMasterComponent {

  displayedColumns: string[] = [
    'srno',
    'ProductName',
    'action',
  ];
  productList :any = []
  productDataSource = new MatTableDataSource(this.productList);
  @ViewChild(MatTable, { static: true }) table: MatTable<any> = Object.create(null);
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator = Object.create(null);

  constructor(private dialog: MatDialog , 
    private firebaseService : FirebaseService ,
    private loaderService : LoaderService,
    private _snackBar: MatSnackBar,) { }


  ngOnInit(): void {
  this.getProductList()
  }

  applyFilter(filterValue: string): void {
    this.productDataSource.filter = filterValue.trim().toLowerCase();
  }
  
  getSerialNumber(index: number): number {
    if (!this.paginator) return index + 1;
    return (this.paginator.pageIndex * this.paginator.pageSize) + index + 1;
  }
  
  addParty(action: string, obj: any) {
    obj.action = action;

    const dialogRef = this.dialog.open(productMasterDialogComponent, { data: obj });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.event === 'Add') {
        const payload: ProductList = {
          id: '',
          productName: result.data.productName,
          userId : localStorage.getItem("userId")
        }

        this.firebaseService.addProduct(payload).then((res) => {
          if (res) {
              this.getProductList()
              this.openConfigSnackBar('record create successfully')
            }
        } , (error) => {
          console.log("error=>" , error);
          
        })
      }
      if (result?.event === 'Edit') {
        this.productList.forEach((element: any) => {
          if (element.id === result.data.id) {
            const payload: ProductList = {
              id: result.data.id,
              productName: result.data.productName,
              userId : localStorage.getItem("userId")
            }
              this.firebaseService.updateProduct(result.data.id , payload).then((res:any) => {
                  this.getProductList()
                  this.openConfigSnackBar('record update successfully')
              }, (error) => {
                console.log("error => " , error);
                
              })
          }
        });
      }
      if (result?.event === 'Delete') {
        this.firebaseService.deleteProduct(result.data.id).then((res:any) => {
            this.getProductList()
            this.openConfigSnackBar('record delete successfully')
        }, (error) => {
          console.log("error => " , error);
          
        })
      }
    });
  }

  getProductList() {
    this.loaderService.setLoader(true)
    this.firebaseService.getAllProduct().subscribe((res: any) => {
      if (res) {
        this.productList = res.filter((id:any) => id.userId === localStorage.getItem("userId"))
        this.productDataSource = new MatTableDataSource(this.productList);
        this.productDataSource.paginator = this.paginator;
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

}



@Component({
  selector: 'app-product-master-dialog',
  templateUrl: 'product-master-dialog.html',
  styleUrls: ['./product-master.component.scss']
})

export class productMasterDialogComponent implements OnInit {
  productForm: FormGroup;
  action: string;
  local_data: any;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<productMasterDialogComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any
  ) {

    this.local_data = { ...data };
    this.action = this.local_data.action;
    
  }
  ngOnInit(): void {
    this.buildForm()
    if (this.action === 'Edit') {
      this.productForm.controls['productName'].setValue(this.local_data.productName)
    }
  }

  buildForm() {
    this.productForm = this.fb.group({
      productName: ['',Validators.required],
    })
  }

  doAction(): void {
    const payload = {
      id: this.local_data.id ? this.local_data.id : '',
      productName: this.productForm.value.productName,
    }
    this.dialogRef.close({ event: this.action, data: payload });
  }

  closeDialog(): void {
    this.dialogRef.close({ event: 'Cancel' });
  }
}