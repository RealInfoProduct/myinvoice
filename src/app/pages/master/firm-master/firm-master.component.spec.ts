import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FirmMasterComponent } from './firm-master.component';

describe('FirmMasterComponent', () => {
  let component: FirmMasterComponent;
  let fixture: ComponentFixture<FirmMasterComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FirmMasterComponent]
    });
    fixture = TestBed.createComponent(FirmMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
