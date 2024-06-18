import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MasterRoutes, MasterRoutingModule } from './master-routing.module';
import { PartyMasterComponent, partyMasterDialogComponent } from './party-master/party-master.component';
import { FirmMasterComponent, firmMasterDialogComponent } from './firm-master/firm-master.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatNativeDateModule } from '@angular/material/core';
import { RouterModule } from '@angular/router';
import { TablerIconsModule } from 'angular-tabler-icons';
import { NgApexchartsModule } from 'ng-apexcharts';
import { MaterialModule } from 'src/app/material.module';
import { ProductMasterComponent, productMasterDialogComponent} from './product-master/product-master.component';
import { AddInvoiceComponent } from './invoice-list/add-invoice/add-invoice.component';
import { InvoiceListComponent, productdialog} from './invoice-list/invoice-list.component';
import { PdfviewComponent } from './invoice-list/add-invoice/pdfview/pdfview.component';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpLoaderFactory } from 'src/app/app.module';
import { HttpClient } from '@angular/common/http';


@NgModule({
  declarations: [
    PartyMasterComponent,
    FirmMasterComponent,
    partyMasterDialogComponent,
    firmMasterDialogComponent,
    ProductMasterComponent,
    productMasterDialogComponent,
    InvoiceListComponent,
    AddInvoiceComponent,
    PdfviewComponent,
    productdialog
  ],
  imports: [
    CommonModule,
    MasterRoutingModule,
    RouterModule.forChild(MasterRoutes),
    MaterialModule,
    FormsModule,
    MaterialModule,
    ReactiveFormsModule,
    TablerIconsModule,
    MatNativeDateModule,
    NgApexchartsModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
  ],
})
export class MasterModule { }
