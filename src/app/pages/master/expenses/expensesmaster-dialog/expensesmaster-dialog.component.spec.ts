import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpensesmasterDialogComponent } from './expensesmaster-dialog.component';

describe('ExpensesmasterDialogComponent', () => {
  let component: ExpensesmasterDialogComponent;
  let fixture: ComponentFixture<ExpensesmasterDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ExpensesmasterDialogComponent]
    });
    fixture = TestBed.createComponent(ExpensesmasterDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
