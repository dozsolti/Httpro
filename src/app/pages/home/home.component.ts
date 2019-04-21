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
    userId: 1
  }


  constructor(private blogService: BlogService) { }

  ngOnInit() {
    this.GetPosts();
  }
  SavePost() {
    this.blogService.createPost(this.newPost, this.newPostForm).then(() => {
      console.log("New post:",this.newPost);
      //console.log(this.posts);
      //if (this.newPost.hasError === false)
      this.GetPosts();
    });
  }
  GetPosts() {
    console.log("Posts: ",this.posts)
    this.blogService.getLatestPosts(this.posts);
  }

}
