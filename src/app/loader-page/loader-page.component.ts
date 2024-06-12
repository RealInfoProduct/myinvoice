import { Component } from '@angular/core';
import { LoaderService } from '../services/loader.service';

@Component({
  selector: 'app-loader-page',
  templateUrl: './loader-page.component.html',
  styleUrls: ['./loader-page.component.scss']
})
export class LoaderPageComponent {

  constructor(private loaderService :LoaderService) { }

  loading : boolean = false

  ngOnInit(): void {
    this.loaderService.loaderSetValue$.subscribe((res)=>{
      this.loading = res
    })
  }

}
