import { Component, ViewChild } from '@angular/core';
import { MatAccordion } from '@angular/material/expansion'

@Component({
  selector: 'app-expansion',
  templateUrl: './expansion.component.html'
})
export class AppExpansionComponent {
  // 2 expand all
  @ViewChild(MatAccordion) accordion: MatAccordion;
  constructor() { }

  // 1 basic
  panelOpenState = false;

  // 3 accordian
  step = 0;

  setStep(index: number) {
    this.step = index;
  }

  nextStep() {
    this.step++;
  }

  prevStep() {
    this.step--;
  }

}
