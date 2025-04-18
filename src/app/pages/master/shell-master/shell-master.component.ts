import { Component, OnInit } from '@angular/core';
import { FirebaseService } from 'src/app/services/firebase.service';
import { LoaderService } from 'src/app/services/loader.service';
import { course } from '../../apps/courses/course';
import { CourseService } from '../../apps/courses/course.service';

@Component({
  selector: 'app-shell-master',
  templateUrl: './shell-master.component.html',
  styleUrls: ['./shell-master.component.scss']
})
export class ShellMasterComponent implements OnInit {


  searchText: string = '';
  customerName: string = '';
  customerMobileNumber: number;
  selectedProductUniqueNumbers: number[] = [];
  purchaseList: any = []
  purchaseFilter: any = []
  filteredPurchaseList: any = []
  productList: any = []
  discounts: number[] = [];
  displayedColumns: string[] = [
    'srno',
    'productName',
    'shellAmount',
    'discount',
    'finalAmount'
  ]

  constructor(private firebaseService: FirebaseService,
    private loaderService: LoaderService,
  ) { }

  ngOnInit(): void {
    this.getPurchaseList()
    this.getProductList() 
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

  getPurchaseList() {
    this.loaderService.setLoader(true)
    this.firebaseService.getAllPurchase().subscribe((res: any) => {
      if (res) {
        this.loaderService.setLoader(true)
        this.purchaseList = res.filter((id: any) => id.userId === localStorage.getItem("userId") && !id.isShell)
        this.purchaseFilter = this.purchaseList
        this.loaderService.setLoader(false)
      }
    })
  }

  getProductList() {
    this.loaderService.setLoader(true)
    this.firebaseService.getAllProduct().subscribe((res: any) => {
      if (res) {
        this.productList = res.filter((id:any) => id.userId === localStorage.getItem("userId"))
        this.loaderService.setLoader(false)
      }
    })
  }

  shellProduct() {
    this.loaderService.setLoader(true)
    this.filteredPurchaseList = this.purchaseList.filter((item: any) =>
      this.selectedProductUniqueNumbers.includes(item.productUniqueNumber)
    );
    console.log('filteredPurchaseList==>>'  ,this.filteredPurchaseList);
    
    this.loaderService.setLoader(false)
  }

  getProductName(productid:string){
    return this.productList.find((id:any) => id.id === productid)?.productName
  }

  updatePurchase(){
    this.filteredPurchaseList = this.filteredPurchaseList.map((item:any, i : number) => {
      const discount = this.discounts[i] || 0;
      return {
        ...item,
        shellDiscount: discount,
        finalAmount: item.shellAmount - discount,
        productProfit: item.shellAmount - discount - item.purchaseAmount,
        isShell : true,
        customerName : this.customerName,
        customerNumber : this.customerMobileNumber
      };
    });
    this.filteredPurchaseList.forEach((element:any) => {
      this.firebaseService.updatePurchase(element.id, element).then((res: any) => {
        this.getProductList()
        this.filteredPurchaseList = []
        this.selectedProductUniqueNumbers = []
        this.customerName = ''
        this.customerMobileNumber = 0
      }, (error) => {
        console.log("error => ", error);
  
      })
    });    
  }

  validateDiscount(index: number, shellAmount: number) {
    if (this.discounts[index] > shellAmount) {
      this.discounts[index] = shellAmount;
    }
  }
  
}
