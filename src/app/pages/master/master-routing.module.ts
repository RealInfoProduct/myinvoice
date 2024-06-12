import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PartyMasterComponent } from './party-master/party-master.component';
import { FirmMasterComponent } from './firm-master/firm-master.component';
import { FullComponent } from 'src/app/layouts/full/full.component';
import { ProductMasterComponent } from './product-master/product-master.component';
import { AddInvoiceComponent } from './invoice-list/add-invoice/add-invoice.component';
import { InvoiceListComponent } from './invoice-list/invoice-list.component';


export const MasterRoutes: Routes = [
  {
    path: '',
    component: FullComponent,
    children: [
      {
        path: 'partymaster',
        component: PartyMasterComponent,
        data: {
          title: 'Party Master',
          urls: [
            { title: 'Master', url: '/master/partymaster' },
            { title: 'Party Master' },
          ],
        },
      },
      {
        path: 'firmmaster',
        component: FirmMasterComponent,
        data: {
          title: 'Firm Master',
          urls: [
            { title: 'Master', url: '/master/firmmaster' },
            { title: 'Firm Master' },
          ],
        },
      },
      {
        path: 'productmaster',
        component: ProductMasterComponent,
        data: {
          title: 'Product Master',
          urls: [
            { title: 'Master', url: '/master/productmaster' },
            { title: 'Product Master' },
          ],
        },
      },
      {
        path: 'invoicelist',
        component: InvoiceListComponent,
        data: {
          title: 'Invoice List',
          urls: [
            { title: 'Master', url: '/master/invoicelist' },
            { title: 'Invoice List' },
          ],
        },
      },
      {
        path: 'addinvoice',
        component: AddInvoiceComponent,
        data: {
          title: 'Add Invoice',
          urls: [
            { title: 'Master', url: '/master/addinvoice' },
            { title: 'Add Invoice' },
          ],
        },
      },
    ],
  }
];

@NgModule({
  imports: [RouterModule.forChild(MasterRoutes)],
  exports: [RouterModule]
})
export class MasterRoutingModule { }
