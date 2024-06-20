import { Component } from '@angular/core';
import { MaterialModule } from '../../../material.module';
import { NgFor } from '@angular/common';
import { FirebaseService } from 'src/app/services/firebase.service';
import { LoaderService } from 'src/app/services/loader.service';
import { TranslateService } from '@ngx-translate/core';

interface topcards {
  id: number;
  img: string;
  color: string;
  title: string;
  subtitle: number;
}

@Component({
  selector: 'app-top-cards',
  standalone: true,
  imports: [MaterialModule, NgFor],
  templateUrl: './top-cards.component.html',
})
export class AppTopCardsComponent {
  topcards: topcards[] = [
    {
      id: 1,
      color: 'primary',
      img: '/assets/images/svgs/icon-user-male.svg',
      title: 'Total Firm',
      subtitle: 0,
    },
    {
      id: 2,
      color: 'warning',
      img: '/assets/images/svgs/icon-briefcase.svg',
      title: 'Total Party',
      subtitle: 0,
    },
    {
      id: 3,
      color: 'accent',
      img: '/assets/images/svgs/icon-mailbox.svg',
      title: 'Total Invoice',
      subtitle: 0,
    },
    {
      id: 4,
      color: 'error',
      img: '/assets/images/svgs/icon-favorites.svg',
      title: 'Pending Bills',
      subtitle: 0,
    },
    {
      id: 5,
      color: 'success',
      img: '/assets/images/svgs/icon-speech-bubble.svg',
      title: 'Ava. Balance',
      subtitle: 0,
    },
    {
      id: 6,
      color: 'accent',
      img: '/assets/images/svgs/icon-connect.svg',
      title: 'Total Product',
      subtitle: 0,
    },
  ];

  constructor(private firebaseService : FirebaseService, private loaderService : LoaderService , private translate : TranslateService){
    
    this.loaderService.setLoader(true)
    this.translate.get('dashboard').subscribe((res: any) => {
      this.topcards[0].title = res[0].TotalFirm
      this.topcards[1].title = res[1].TotalParty
      this.topcards[5].title = res[4].TotalProduct
      this.topcards[2].title = res[2].TotalInvoice
      this.topcards[3].title = res[3].PendingBills
    })
    this.firebaseService.getAllFirm().subscribe((res:any) => {
      if (res) {        
        this.topcards[0].subtitle = res.filter((id:any) => id.userId === localStorage.getItem("userId")).length          
        this.loaderService.setLoader(false)
      }
    })
    this.firebaseService.getAllParty().subscribe((res:any) => {
      if (res) {        
        this.topcards[1].subtitle = res.filter((id:any) => id.userId === localStorage.getItem("userId")).length          
        this.loaderService.setLoader(false)
      }
    })
    this.firebaseService.getAllProduct().subscribe((res:any) => {
      if (res) {        
        this.topcards[5].subtitle = res.filter((id:any) => id.userId === localStorage.getItem("userId")).length          
        this.loaderService.setLoader(false)
      }
    })
    this.firebaseService.getAllInvoice().subscribe((res:any) => {
      if (res) {        
        this.topcards[2].subtitle = res.filter((id:any) => 
          id.userId === localStorage.getItem("userId") && 
          id.accountYear === localStorage.getItem("accountYear")
         ).length          
        this.loaderService.setLoader(false)
      }
    })
    this.firebaseService.getAllInvoice().subscribe((res:any) => {
      if (res) {
        this.topcards[3].subtitle = res.filter((id:any) => 
          id.userId === localStorage.getItem("userId") && 
          id.accountYear === localStorage.getItem("accountYear") && 
          id.isPayment === false
         ).length          
        this.loaderService.setLoader(false)
      }
    })

  }
}
