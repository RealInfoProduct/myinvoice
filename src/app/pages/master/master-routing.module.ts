import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FullComponent } from 'src/app/layouts/full/full.component';
import { ProductMasterComponent } from './product-master/product-master.component';
import { PurchaseMasterComponent } from './purchase-master/purchase-master.component';
import { ShellMasterComponent } from './shell-master/shell-master.component';
import { ShellListComponent } from './shell-list/shell-list.component';
import { CreateinvoiceComponent } from './createinvoice/createinvoice.component';
import { InvoiceListComponent } from './invoice-list/invoice-list.component';
import { InvoiceViewComponent } from './invoice-view/invoice-view.component';


export const MasterRoutes: Routes = [
  {
    path: '',
    component: FullComponent,
    children: [
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
        path: 'purchase',
        component: PurchaseMasterComponent,
        data: {
          title: 'Purchase',
          urls: [
            { title: 'Master', url: '/master/purchase' },
            { title: 'Purchase' },
          ],
        },
      },
      {
        path: 'shell',
        component: ShellMasterComponent,
        data: {
          title: 'Shell',
          urls: [
            { title: 'Master', url: '/master/shell' },
            { title: 'Shell' },
          ],
        },
      },
      {
        path: 'shelllist',
        component: ShellListComponent,
        data: {
          title: 'Shell List',
          urls: [
            { title: 'Master', url: '/master/shelllist' },
            { title: 'Shell List' },
          ],
        },
      },
      {
        path: 'invoice',
        component: CreateinvoiceComponent,
        data: {
          title: 'invoice',
          urls: [
            { title: 'Master', url: '/master/invoice' },
            { title: 'invoice' },
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
              path: 'viewinvoice/:id',
              component: InvoiceViewComponent,
              data: {
                title: 'View Invoice',
                urls: [
                  { title: 'Master', url: '/master/viewinvoice' },
                  { title: 'View Invoice' },
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
