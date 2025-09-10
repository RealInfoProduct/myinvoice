import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { FirebaseService } from './services/firebase.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent {

  constructor(public translate: TranslateService , private router: Router , private firebaseService : FirebaseService) {
    translate.addLangs(['en', 'fr','es','de']);
    translate.setDefaultLang('en');
    this.logActivePath()

  }


  logActivePath() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.firebaseService.getUserList().subscribe((res => {
          if (res) {
            const userData: any = res.find((id: any) => id.id === localStorage.getItem("userId"))
              if (!userData?.isActive) {
                  localStorage.clear()
                  this.router.navigate(['/authentication/side-login']);
              }
          }
        }))
      }
    });
  }


  
}
