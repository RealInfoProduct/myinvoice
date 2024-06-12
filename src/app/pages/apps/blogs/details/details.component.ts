import { Component, OnInit } from '@angular/core';
import { blogService } from '../blogService.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-blog-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss'],
})
export class AppBlogDetailsComponent implements OnInit{
  title: any;
  blogDetail: any = null;
  
  istoggleReply = true;  
     
  toggleReply() {  
    this.istoggleReply = !this.istoggleReply;  
  }
  activeRoute:any= this.router.url.split('/').pop();

  constructor(
    public router: Router,
    activatedRouter: ActivatedRoute,
    public blogService: blogService
  ){
    this.title = activatedRouter.snapshot.paramMap.get('id');
    

  }

  ngOnInit(): void {
    if (this.blogService.blogPosts.length === 0){
      this.blogService.getBlog().subscribe((d: any) => (this.blogService.blogPosts = d));
    }
    
    this.blogDetail = this.blogService.blogPosts.filter(x => x.title === this.title);
    console.log(this.blogDetail)
  }
}
