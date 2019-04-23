import { Component, OnInit } from '@angular/core';
import { BlogService } from 'src/app/service/blog.service';
import { HttproModel } from 'src/app/service/httpro/httpro.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  posts: HttproModel = new HttproModel([]);

  newPost = new HttproModel(); 
  newPostForm = {
    title: 'foo',
    body: 'bar',
    userId: 1,
    bo:false,
    a: [
      {
        a:2,
        b:"C"
      },
      {
        d:{
          now : new Date()
        }
      }
    ]
  }
  file = null;


  constructor(private blogService: BlogService) { }

  ngOnInit() {
    this.GetPosts();
  }
  setFile($ev) {
    if ($ev.target.files.length === 0) return;
    
    this.file = $ev.target.files[0];
  }
  SavePost() {
    this.blogService.createPost(this.newPost, this.newPostForm, this.file, null).then(() => {
      //console.log(this.posts);
      //if (this.newPost.hasError === false)
      this.GetPosts();
    });
  }
  GetPosts() {
    //console.log("Posts: ",this.posts)
    this.blogService.getLatestPosts(this.posts);
  }

}
