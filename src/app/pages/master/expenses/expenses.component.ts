import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { Timestamp } from 'firebase/firestore';
import { FirebaseService } from 'src/app/services/firebase.service';
import { LoaderService } from 'src/app/services/loader.service';
import { ExpensesDialogComponent } from './expenses-dialog/expenses-dialog.component';
import { ExpensesList, ExpensesmasterList } from 'src/app/interface/invoice';
import { ExpensesmasterDialogComponent } from './expensesmaster-dialog/expensesmaster-dialog.component';

@Component({
  selector: 'app-expenses',
  templateUrl: './expenses.component.html',
  styleUrls: ['./expenses.component.scss']
})
export class ExpensesComponent implements OnInit {

  expensesDataColumns: string[] = ['#', 'expenses', 'creditDate','description', 'amount', 'action'];
  expensesList: any = [];
  expensesmasterList: any = [];

  ExpensesListDataSource = new MatTableDataSource(this.expensesList);
  @ViewChild(MatTable, { static: true }) table: MatTable<any> = Object.create(null);
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator = Object.create(null);

  constructor(private dialog: MatDialog, private firebaseService: FirebaseService, private _snackBar: MatSnackBar,
    private loaderService: LoaderService) { }

  ngOnInit(): void {
    this.getExpensesList()
    this.getExpensesmasterList()
  }

  ngAfterViewInit() {
    this.ExpensesListDataSource.paginator = this.paginator;
  }

  applyFilter(filterValue: string): void {
    this.ExpensesListDataSource.filter = filterValue.trim().toLowerCase();
  }

  convertTimestampToDate(element: any): Date | null {
    if (element instanceof Timestamp) {
      return element.toDate();
    }
    return null;
  }

  getSerialNumber(index: number): number {
    if (!this.paginator) return index + 1;
    return (this.paginator.pageIndex * this.paginator.pageSize) + index + 1;
  }

  openExpensesmaster(action:string,obj:any) {
    const dialogRef = this.dialog.open(ExpensesmasterDialogComponent, {
      data:{...obj,action}
    })
    dialogRef.afterClosed().subscribe((result) => {
      if (result?.event === 'Add') {
        const payload: ExpensesmasterList = {
          id:'',
          type: result.data.type
        }
        this.firebaseService.addExpensesmaster(payload).then((res) => {
          if (res) {
            this.getExpensesmasterList()
            this.openConfigSnackBar('record create successfully')
          }
        }, (error) => {
          console.log("error=>", error);

        })
      }
    })
  }
  openExpenses(action: string, obj: any) {
    const dialogRef = this.dialog.open(ExpensesDialogComponent, {
      data: { ...obj, action },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.event === 'Add') {
        const payload: ExpensesList = {
          id: '',
          expensesname: result.data.expensesname,
          creditDate: result.data.creditDate,
          description: result.data.description,
          amount: result.data.amount,
          userId: localStorage.getItem("userId")
        }
        this.firebaseService.addExpenses(payload).then((res) => {
          if (res) {
            this.getExpensesList()
            this.openConfigSnackBar('record create successfully')
          }
        }, (error) => {
          console.log("error=>", error);

        })
      }
      if (result?.event === 'Edit') {
        const payload: ExpensesList = {
          id: result.data.id,
          expensesname: result.data.expensesname,
          creditDate: result.data.creditDate,
          description: result.data.description,
          amount: result.data.amount,
          userId: localStorage.getItem("userId")
        }
        this.firebaseService.updateExpenses(result.data.id, payload).then((res: any) => {
          this.getExpensesList()
          this.openConfigSnackBar('record update successfully')
        }, (error) => {
          console.log("error => ", error);
        });
      }
      if (result?.event === 'Delete') {
        this.firebaseService.deleteExpenses(result.data.id).then((res: any) => {
          this.getExpensesList()
          this.openConfigSnackBar('record delete successfully')
        }, (error) => {
          console.log("error => ", error);

        })
      }
    });
  }

  getExpensesList() {
    this.loaderService.setLoader(true)
    this.firebaseService.getAllExpenses().subscribe((res: any) => {
      if (res) {
        this.ExpensesListDataSource = new MatTableDataSource(res);
        this.ExpensesListDataSource.paginator = this.paginator;
        this.loaderService.setLoader(false)
      }
    })
  }

  getExpensesmasterList() {
    this.loaderService.setLoader(true)
    this.firebaseService.getAllExpensesmaster().subscribe((res: any) => {
      if (res) {
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

