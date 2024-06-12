import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent {

  constructor(public translate: TranslateService) {
    translate.addLangs(['en', 'fr','es','de']);
    translate.setDefaultLang('en');
  }
}
