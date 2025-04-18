import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShellMasterComponent } from './shell-master.component';

describe('ShellMasterComponent', () => {
  let component: ShellMasterComponent;
  let fixture: ComponentFixture<ShellMasterComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ShellMasterComponent]
    });
    fixture = TestBed.createComponent(ShellMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
