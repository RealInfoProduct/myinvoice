import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BarcodeStickerComponent } from './barcode-sticker.component';

describe('BarcodeStickerComponent', () => {
  let component: BarcodeStickerComponent;
  let fixture: ComponentFixture<BarcodeStickerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BarcodeStickerComponent]
    });
    fixture = TestBed.createComponent(BarcodeStickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
