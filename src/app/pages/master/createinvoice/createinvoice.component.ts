import { Component } from '@angular/core';
import { UntypedFormGroup, UntypedFormArray, UntypedFormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AddedDialogComponent } from '../../apps/invoice/add-invoice/added-dialog/added-dialog.component';
import { InvoiceList, order } from '../../apps/invoice/invoice';
import { ServiceinvoiceService } from '../../apps/invoice/serviceinvoice.service';
import { FirebaseService } from 'src/app/services/firebase.service';
import { LoaderService } from 'src/app/services/loader.service';

@Component({
  selector: 'app-createinvoice',
  templateUrl: './createinvoice.component.html',
  styleUrls: ['./createinvoice.component.scss']
})
export class CreateinvoiceComponent {
 addForm: UntypedFormGroup | any;
  rows: UntypedFormArray;
  invoice: InvoiceList = new InvoiceList();


  ///////////////////////////////////////////////////////////
  subTotal = 0;
  vat = 0;
  grandTotal = 0;
  

  constructor(
    private fb: UntypedFormBuilder,
    private invoiceService: ServiceinvoiceService,
    private router: Router,
    private firebaseService: FirebaseService,
    private loaderService: LoaderService,
    public dialog: MatDialog,
  ) {
    this.getPurchaseList()
    this.getProductList() 

    // tslint:disable-next-line - Disables all
    this.invoice.id =
      Math.max.apply(
        Math,
        this.invoiceService.getInvoiceList().map(function (o: any) {
          return o.id;
        }),
      ) + 1;
    this.invoice.status = 'Pending';

    ///////////////////////////////////////////////////////////

    this.addForm = this.fb.group({});

    this.rows = this.fb.array([]);
    this.addForm.addControl('rows', this.rows);
    this.rows.push(this.createItemFormGroup());
  }

  ////////////////////////////////////////////////////////////////////////////////////
  onAddRow(): void {
    this.rows.push(this.createItemFormGroup());
  }

  onRemoveRow(rowIndex: number): void {
    const totalCostOfItem =
      this.addForm.get('rows')?.value[rowIndex].unitPrice *
      this.addForm.get('rows')?.value[rowIndex].units;

    this.subTotal = this.subTotal - totalCostOfItem;
    this.vat = this.subTotal / 10;
    this.grandTotal = this.subTotal + this.vat;
    this.rows.removeAt(rowIndex);
  }

  createItemFormGroup(): UntypedFormGroup {
    return this.fb.group({
      itemName: ['', Validators.required],
      units: ['', Validators.required],
      unitPrice: ['', Validators.required],
      itemTotal: ['0'],
    });
  }

  itemsChanged(): void {
    let total: number = 0;
    // tslint:disable-next-line - Disables all
    for (let t = 0; t < (<UntypedFormArray>this.addForm.get('rows')).length; t++) {
      if (
        this.addForm.get('rows')?.value[t].unitPrice !== '' &&
        this.addForm.get('rows')?.value[t].units
      ) {
        total =
          this.addForm.get('rows')?.value[t].unitPrice * this.addForm.get('rows')?.value[t].units +
          total;
      }
    }
    this.subTotal = total;
    this.vat = this.subTotal / 10;
    this.grandTotal = this.subTotal + this.vat;
  }
  ////////////////////////////////////////////////////////////////////

  saveDetail(): void {
    this.invoice.grandTotal = this.grandTotal;
    this.invoice.totalCost = this.subTotal;
    this.invoice.vat = this.vat;
    // tslint:disable-next-line - Disables all
    for (let t = 0; t < (<UntypedFormArray>this.addForm.get('rows')).length; t++) {
      const o: order = new order();
      o.itemName = this.addForm.get('rows')?.value[t].itemName;
      o.unitPrice = this.addForm.get('rows')?.value[t].unitPrice;
      o.units = this.addForm.get('rows')?.value[t].units;
      o.unitTotalPrice = o.units * o.unitPrice;
      this.invoice.orders.push(o);
    }
    this.dialog.open(AddedDialogComponent);
    this.invoiceService.addInvoice(this.invoice);
    this.router.navigate(['/apps/invoice']);
  }


  // newwwwwwww
  selectedProductUniqueNumbers: number[] = [];
  purchaseFilter: any = []
  purchaseList: any = []
  searchText: string = '';
  productList: any = []
  filteredPurchaseList: any = []
  discounts: number[] = [];
  customerName: string = '';
  customerMobileNumber: number;
  nextUniqueInvoiceNumber: number;
  invoiceStatus :any = 'Pending'
  firmName :any = 'My Invoice'
  firmAddress :any = 'Address'
  invoiceOrderDate = new Date()

  getPurchaseList() {
    this.loaderService.setLoader(true)
    this.firebaseService.getAllPurchase().subscribe((res: any) => {
      if (res) {
        this.loaderService.setLoader(true)
        this.purchaseList = res.filter((id: any) => id.userId === localStorage.getItem("userId") && !id.isShell)
        this.nextUniqueInvoiceNumber = Math.max(
          0,
          ...res.filter((item: any) => item.userId === localStorage.getItem("userId")).map((item: any) => +item.invoiceNo)
        ) + 1;
        this.purchaseFilter = this.purchaseList
        this.loaderService.setLoader(false)
      }
    })
  }

  getProductList() {
    this.loaderService.setLoader(true)
    this.firebaseService.getAllProduct().subscribe((res: any) => {
      if (res) {
        this.productList = res.filter((id: any) => id.userId === localStorage.getItem("userId"))
        this.loaderService.setLoader(false)
      }
    })
  }


  filteredData() {
    this.purchaseFilter = this.purchaseList

    if (!this.searchText) {
      return this.purchaseFilter;
    }

    return this.purchaseFilter.filter((item: any) =>
      item.productUniqueNumber
        .toString()
        .includes(this.searchText.toLowerCase())
    );
  }

  onDropdownOpen() {
    this.searchText = '';
  }

  onProductSelectionChange() {
    this.loaderService.setLoader(true);
    this.filteredPurchaseList = this.purchaseList.filter((item: any) =>
      this.selectedProductUniqueNumbers.includes(item.productUniqueNumber)
    );
    this.loaderService.setLoader(false);
  }
  validateDiscount(index: number) {
    if (this.discounts[index] > 100) {
      this.discounts[index] = 100;
    } else if (this.discounts[index] < 0) {
      this.discounts[index] = 0;
    }
  }

  getProductName(productid: string) {
    return this.productList.find((id: any) => id.id === productid)?.productName
  }

  get productsubTotal(): number {
    return this.filteredPurchaseList.reduce((total: number, row: any) => total + row.shellAmount, 0);
  }
  
  get totalDiscount(): number {
    return this.filteredPurchaseList.reduce((total: number, row: any, i: number) => {
      const discountPercent = this.discounts[i] || 0;
      const discountAmount = (discountPercent / 100) * row.shellAmount;
      return total + discountAmount;
    }, 0);
  }
  
  get productgrandTotal(): number {
    return this.filteredPurchaseList.reduce((total: number, row: any, i: number) => {
      const discountPercent = this.discounts[i] || 0;
      const discountAmount = (discountPercent / 100) * row.shellAmount;
      return total + (row.shellAmount - discountAmount);
    }, 0);
  }
  


  saveInvoiceDetail() {
    // Modify the purchase list with discounts and final amounts
    this.filteredPurchaseList = this.filteredPurchaseList.map((item: any, i: number) => {
      const discountPercent = this.discounts[i] || 0;
      const discountAmount = (discountPercent / 100) * item.shellAmount;
      const finalAmount = item.shellAmount - discountAmount;
  
      return {
        ...item,
        shellDiscount: discountPercent,
        finalAmount,
        productProfit: finalAmount - item.purchaseAmount,
        isShell: true,
        customerName: this.customerName,
        customerNumber: this.customerMobileNumber,
        invoiceNo: this.nextUniqueInvoiceNumber,
        invoiceDate: this.invoiceOrderDate,
        firmName: this.firmName,
        firmAddress: this.firmAddress,
        invoiceStatus: this.invoiceStatus,
      };
    });
  
    // Use Promise.all to wait for all updates to complete
    const updatePromises = this.filteredPurchaseList.map((element: any) => {
      return this.firebaseService.updatePurchase(element.id, element);
    });

    // Once all updates are done, perform the necessary actions
    Promise.all(updatePromises)
      .then(() => {
        this.filteredPurchaseList = [];
        this.selectedProductUniqueNumbers = [];
        this.customerName = '';
        this.customerMobileNumber = 0;
        const previousInvoiceNumber = this.nextUniqueInvoiceNumber - 1;
        const invoiceUrl = `${window.location.origin}/master/viewinvoice/${previousInvoiceNumber}`;
        window.open(invoiceUrl, '_blank');
        this.getProductList();
        this.getPurchaseList();
      })
      .catch((error) => {
        console.log("Error during update:", error);
      });
  }
  
}
