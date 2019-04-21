import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.prod';
import { Httpro } from './httpro/httpro.service';
import { HttproModel } from './httpro/httpro.model';

@Injectable({
  providedIn: 'root'
})
export class BlogService {

  constructor(private httpro: Httpro) { }

  getLatestPosts(model: HttproModel, limit = 2) {

    return this.httpro
      .get(`${environment.baseURL}/posts`)
      .query({ _limit: limit })
      .to(model)
      .exec();
  }
  createPost(model: HttproModel, body) {

    return this.httpro
      .post(`${environment.baseURL}/posts`)
      .body(body)
      .to(model)
      .exec();
  }
}
