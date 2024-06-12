import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../../../material.module';
import { MatNativeDateModule } from '@angular/material/core';

// icons
import { TablerIconsModule } from 'angular-tabler-icons';
import * as TablerIcons from 'angular-tabler-icons/icons';

import { LandingPageRoutes } from './landingpage.routing';
import { AppLandingpageComponent } from './landingpage.component';

// theme pages

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(LandingPageRoutes),
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    TablerIconsModule.pick(TablerIcons),
    MatNativeDateModule,
  ],
  declarations: [
    AppLandingpageComponent
  ],
})
export class LandingPageModule {}
