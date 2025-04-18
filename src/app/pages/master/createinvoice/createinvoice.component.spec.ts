import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateinvoiceComponent } from './createinvoice.component';

describe('CreateinvoiceComponent', () => {
  let component: CreateinvoiceComponent;
  let fixture: ComponentFixture<CreateinvoiceComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CreateinvoiceComponent]
    });
    fixture = TestBed.createComponent(CreateinvoiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
