import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../../material.module';

// icons
import { TablerIconsModule } from 'angular-tabler-icons';
import * as TablerIcons from 'angular-tabler-icons/icons';

import { UiComponentsRoutes } from './ui-components.routing';

// ui components
import { AppBadgeComponent } from './badge/badge.component';
import { AppExpansionComponent } from './expansion/expansion.component';
import { AppChipsComponent } from './chips/chips.component';
import {
  AppDialogComponent,
  AppDialogContentComponent,
  AppDialogDataComponent,
  AppDialogMenuComponent,
  AppDialogOverviewComponent,
} from './dialog/dialog.component';
import { AppListsComponent } from './lists/lists.component';
import { AppDividerComponent } from './divider/divider.component';
import { AppMenuComponent } from './menu/menu.component';
import { AppPaginatorComponent } from './paginator/paginator.component';
import { AppProgressComponent } from './progress/progress.component';
import { AppProgressSnipperComponent } from './progress-snipper/progress-snipper.component';
import { AppRipplesComponent } from './ripples/ripples.component';
import { AppSlideToggleComponent } from './slide-toggle/slide-toggle.component';
import { AppSliderComponent } from './slider/slider.component';
import { AppSnackbarComponent } from './snackbar/snackbar.component';
import { AppTabsComponent } from './tabs/tabs.component';
import { AppToolbarComponent } from './toolbar/toolbar.component';
import { AppTooltipsComponent } from './tooltips/tooltips.component';
import { MatNativeDateModule } from '@angular/material/core';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(UiComponentsRoutes),
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    TablerIconsModule.pick(TablerIcons),
    MatNativeDateModule
  ],
  declarations: [
    AppBadgeComponent,
    AppExpansionComponent,
    AppChipsComponent,
    AppDialogComponent,
    AppDialogOverviewComponent,
    AppDialogContentComponent,
    AppDialogDataComponent,
    AppDialogMenuComponent,
    AppListsComponent,
    AppDividerComponent,
    AppMenuComponent,
    AppPaginatorComponent,
    AppProgressComponent,
    AppProgressSnipperComponent,
    AppRipplesComponent,
    AppSlideToggleComponent,
    AppSliderComponent,
    AppSnackbarComponent,
    AppTabsComponent,
    AppToolbarComponent,
    AppTooltipsComponent,
  ],
})
export class UicomponentsModule {}
