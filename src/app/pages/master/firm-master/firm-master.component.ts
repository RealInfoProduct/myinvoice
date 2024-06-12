import { Component, Inject, OnInit, Optional, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { FirmList } from 'src/app/interface/invoice';
import { FirebaseService } from 'src/app/services/firebase.service';
import { LoaderService } from 'src/app/services/loader.service';


@Component({
  selector: 'app-firm-master',
  templateUrl: './firm-master.component.html',
  styleUrls: ['./firm-master.component.scss']
})
export class FirmMasterComponent implements OnInit {
  @ViewChild(MatTable, { static: true }) table: MatTable<any> = Object.create(null);
  displayedColumns: string[] = [
    '#',
    'header',
    'Subheader',
    'GSTMo',
    'gst',
    'PanNo',
    'MobileNo',
    'PersonalMobileNo',
    'BankName',
    'BankIFSC',
    'BankAccountNo',
    'Address',
    'action',
  ];
  firmList: any
  dataSource: any
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator = Object.create(null);

  constructor(private dialog: MatDialog, 
    private firebaseService: FirebaseService , 
    private loaderService : LoaderService,
    private _snackBar: MatSnackBar,) { }

  ngOnInit(): void {
    this.getFirmList()
  }


  applyFilter(filterValue: string): void {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  generateRandomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  getFirmList() {
    this.loaderService.setLoader(true)
    this.firebaseService.getAllFirm().subscribe((res: any) => {
      if (res) {
        this.firmList = res.filter((id:any) => id.userId === localStorage.getItem("userId"))
        this.dataSource = new MatTableDataSource(this.firmList);
        this.dataSource.paginator = this.paginator;
        this.loaderService.setLoader(false)
      }
    })
  }

  addFirm(action: string, obj: any) {
    obj.action = action;
    const dialogRef = this.dialog.open(firmMasterDialogComponent, {
      data: obj,
      width: '40%'
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.event === 'Add') {
        const payload: FirmList = {
          id: '',
          header: result.data.header,
          subHeader: result.data.subHeader,
          address: result.data.address,
          gstNo: result.data.GSTNo,
          gstpercentage: Number(result.data.gstPercentage),
          panNo: result.data.panNo,
          mobileNo: Number(result.data.mobileNo),
          personalMobileNo: Number(result.data.personalMobileNo),
          bankName: result.data.bankName,
          bankIfsc: result.data.ifscCode,
          bankAccountNo: Number(result.data.bankAccountNo),
          userId : localStorage.getItem("userId")
        }
        this.firebaseService.addFirm(payload).then((res) => {
          if (res) {
            this.getFirmList()
            this.openConfigSnackBar('record create successfully')
          }
        }, (error) => {
          console.log("error=>", error);

        })
      }
      if (result?.event === 'Edit') {
        this.firmList.forEach((element: any) => {
          if (element.id === result.data.id) {
            const payload: FirmList = {
              id: result.data.id,
              header: result.data.header,
              subHeader: result.data.subHeader,
              address: result.data.address,
              gstNo: result.data.GSTNo,
              gstpercentage: Number(result.data.gstPercentage),
              panNo: result.data.panNo,
              mobileNo: Number(result.data.mobileNo),
              personalMobileNo: Number(result.data.personalMobileNo),
              bankName: result.data.bankName,
              bankIfsc: result.data.ifscCode,
              bankAccountNo: Number(result.data.bankAccountNo),
              userId : localStorage.getItem("userId")
            }
            this.firebaseService.updateFirm(result.data.id, payload).then((res: any) => {
              if (res) {
                this.getFirmList()
            this.openConfigSnackBar('record update successfully')

              }
            }, (error) => {
              console.log("error => ", error);

            })
          }
        });
      }
      if (result?.event === 'Delete') {
        this.firebaseService.deleteFirm(result.data.id).then((res: any) => {
          if (res) {
            this.getFirmList()
            this.openConfigSnackBar('record delete successfully')

          }
        }, (error) => {
          console.log("error => ", error);

        })
      }
    });
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
  selector: 'app-firm-master-dialog',
  templateUrl: 'firm-master-dialog.html',
  styleUrls: ['./firm-master.component.scss']
})


export class firmMasterDialogComponent implements OnInit {
  firmForm: FormGroup;
  action: string;
  local_data: any;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<firmMasterDialogComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any
  ) {

    this.local_data = { ...data };
    this.action = this.local_data.action;
  }
  ngOnInit(): void {
    this.formBuild()
    if (this.action === 'Edit') {
      this.firmForm.controls['header'].setValue(this.local_data.header)
      this.firmForm.controls['subHeader'].setValue(this.local_data.subHeader)
      this.firmForm.controls['address'].setValue(this.local_data.address)
      this.firmForm.controls['GSTNo'].setValue(this.local_data.gstNo)
      this.firmForm.controls['gstPercentage'].setValue(this.local_data.gstpercentage)
      this.firmForm.controls['panNo'].setValue(this.local_data.panNo)
      this.firmForm.controls['mobileNo'].setValue(this.local_data.mobileNo)
      this.firmForm.controls['personalMobileNo'].setValue(this.local_data.personalMobileNo)
      this.firmForm.controls['bankName'].setValue(this.local_data.bankName)
      this.firmForm.controls['ifscCode'].setValue(this.local_data.bankIfsc)
      this.firmForm.controls['bankAccountNo'].setValue(this.local_data.bankAccountNo)
    }
  }

  formBuild() {
    this.firmForm = this.fb.group({
      header: ['', Validators.required],
      subHeader: [''],
      address: [''],
      GSTNo: [''],
      gstPercentage: [''],
      panNo: [''],
      mobileNo: ['',[Validators.required,Validators.pattern(/^\d{10}$/)]],
      personalMobileNo: ['',[Validators.required,Validators.pattern(/^\d{10}$/)]],
      bankName: [''],
      ifscCode: [''],
      bankAccountNo: [''],
    })
  }

  doAction(): void {
    const payload = {
      id: this.local_data.id ? this.local_data.id : '',
      header: this.firmForm.value.header,
      subHeader: this.firmForm.value.subHeader,
      address: this.firmForm.value.address,
      GSTNo: this.firmForm.value.GSTNo,
      gstPercentage: this.firmForm.value.gstPercentage,
      panNo: this.firmForm.value.panNo,
      mobileNo: this.firmForm.value.mobileNo,
      personalMobileNo: this.firmForm.value.personalMobileNo,
      bankName: this.firmForm.value.bankName,
      ifscCode: this.firmForm.value.ifscCode,
      bankAccountNo: this.firmForm.value.bankAccountNo
    }
    this.dialogRef.close({ event: this.action, data: payload });

  }

  closeDialog(): void {
    this.dialogRef.close({ event: 'Cancel' });
  }

}
