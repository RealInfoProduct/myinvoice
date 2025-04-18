import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShellListComponent } from './shell-list.component';

describe('ShellListComponent', () => {
  let component: ShellListComponent;
  let fixture: ComponentFixture<ShellListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ShellListComponent]
    });
    fixture = TestBed.createComponent(ShellListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
