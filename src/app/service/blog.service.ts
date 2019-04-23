import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.prod';
import { Httpro, BodyTypes } from './httpro/httpro.service';
import { HttproModel } from './httpro/httpro.model';

@Injectable({
  providedIn: 'root'
})
export class BlogService {

  constructor(private httpro: Httpro) { }

  getLatestPosts(model: HttproModel, limit = 2) {

    return this.httpro
      .get('https://mindtrip.ro/api/blog/post/filters')
      .useToken()
      //.get(`${environment.baseURL}/posts`)
      .query({ _limit: limit })
      .to(model)
      .exec();
  }
  createPost(model: HttproModel, body,file1, file2) {

    return this.httpro
      .post(`${environment.baseURL}/posts`)
      .bodyType(BodyTypes.FORMDATA)
      .body(body)
      .file("file1",file1)
      .file("file2",file2)
      .to(model)
      .exec();
  }
}
