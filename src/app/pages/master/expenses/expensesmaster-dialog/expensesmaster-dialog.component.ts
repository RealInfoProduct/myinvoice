import { Component, Inject, OnInit, Optional } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-expensesmaster-dialog',
  templateUrl: './expensesmaster-dialog.component.html',
  styleUrls: ['./expensesmaster-dialog.component.scss']
})
export class ExpensesmasterDialogComponent implements OnInit {

  expensesMasterForm: FormGroup
  local_data: any;
  action: string;

  constructor(private fb: FormBuilder, public dialogRef: MatDialogRef<ExpensesmasterDialogComponent>,
    
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any) {
    this.local_data = { ...data };
    this.action = this.local_data.action;
  }

  ngOnInit(): void {
    this.expensesMasterData()
  }

  expensesMasterData() {
    this.expensesMasterForm = this.fb.group({
      type: ['', Validators.required]
    })
  }

  doAction(): void {
    const payload = this.expensesMasterForm.value
    this.dialogRef.close({ event: this.action, data: payload });
  }

}

