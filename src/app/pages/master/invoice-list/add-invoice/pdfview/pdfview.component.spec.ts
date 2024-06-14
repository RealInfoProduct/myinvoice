import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PdfviewComponent } from './pdfview.component';

describe('PdfviewComponent', () => {
  let component: PdfviewComponent;
  let fixture: ComponentFixture<PdfviewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PdfviewComponent]
    });
    fixture = TestBed.createComponent(PdfviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
