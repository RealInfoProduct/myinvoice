import { Component } from '@angular/core';
import { MaterialModule } from '../../../material.module';
import { TablerIconsModule } from 'angular-tabler-icons';
interface Food {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-form-layouts',
  standalone: true,
  imports: [MaterialModule, TablerIconsModule],
  templateUrl: './form-layouts.component.html',
})
export class AppFormLayoutsComponent {
  constructor() {}
  foods: Food[] = [
    { value: 'steak-0', viewValue: 'One' },
    { value: 'pizza-1', viewValue: 'Two' },
    { value: 'tacos-2', viewValue: 'Three' },
    { value: 'tacos-3', viewValue: 'Four' },
  ];

  selectedFood = this.foods[2].value;
}
