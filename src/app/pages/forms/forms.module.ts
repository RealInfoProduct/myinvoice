import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../../material.module';
import { MatNativeDateModule } from '@angular/material/core';

// icons
import { TablerIconsModule } from 'angular-tabler-icons';
import * as TablerIcons from 'angular-tabler-icons/icons';

import { FormsRoutes } from './forms.routing';

// form elements
import {
  AppAutocompleteComponent,
  AppButtonComponent,
  AppCheckboxComponent,
  AppDatepickerComponent,
  AppRadioComponent,
} from './form-elements';
import { AppFormLayoutsComponent } from './form-layouts/form-layouts.component';
import { AppFormHorizontalComponent } from './form-horizontal/form-horizontal.component';
import { AppFormVerticalComponent } from './form-vertical/form-vertical.component';
import { AppFormWizardComponent } from './form-wizard/form-wizard.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(FormsRoutes),
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    TablerIconsModule.pick(TablerIcons),
    MatNativeDateModule,

    AppAutocompleteComponent,
    AppButtonComponent,
    AppCheckboxComponent,
    AppRadioComponent,
    AppDatepickerComponent,
    AppFormLayoutsComponent,
    AppFormHorizontalComponent,
    AppFormVerticalComponent,
    AppFormWizardComponent,
  ],
})
export class FormModule {}
