import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { HttproModel } from './httpro.model';

import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class Httpro {

  private url = "";
  private method = "";

  private searchParams = {};
  private requestBody = {};

  private model: HttproModel = null;

  private messages = {
    loading: "Loading...",
    empty: "No results",
    generalError: "Ceva nu a mers bine",
  }
  constructor(private http: HttpClient) { }


  get(url) {
    this.setRequest("get", url);
    return this;
  }
  post(url) {
    this.setRequest("post", url);
    return this;
  }
  private setRequest(method, url) {
    this.method = method;
    this.url = url;

    this.requestBody = {};
    this.searchParams = {};
    this.model = null;
  }


  public query(query) {
    this.searchParams = { ...query };
    return this;
  }
  public body(body) {
    this.requestBody = { ...body };
    return this;
  }

  to(model: HttproModel) {
    
    this.model = model;
    return this;
  }

  exec() {
    return new Promise(resolve => {
      return new Observable(observer => {

        observer.next({ message: this.messages.loading });

        this.request()
          .subscribe(
            response => {

              observer.next(this.DataFromReponse(response))
            },
            err => observer.error(err));

      })
        .pipe(catchError(error => this.handleError(error)))
        .subscribe(
          data => this.DataToModel(data),
          error => this.ErrorToModel(error)
        ).add(
          resolve(true)
        );
    });
  }

  //Functioneaza pe responseuri cu date si cu sau fara campul de status
  private DataFromReponse(response) {
    let responseKeys = Object.keys(response);
    //empty result
    if (responseKeys.length === 0)
      return { message: this.messages.empty };


    let value = null;
    //model contine tot in afara se campul de status
    if (responseKeys.indexOf('status') > -1) {
      delete response['status'];
      responseKeys.splice(responseKeys.indexOf('status'), 1);
    }

    //Daca responseul este doar un singur camp nu are rost ca value sa contina parentul. Ex. Daca responseul este { articles : [a,b,c] } atunci values va contine doar [a,b,c], fara articles
    //Folosesc clasa JSON pentru a crea o clona a obiectului reponse
    if (responseKeys.length === 1)
      value = JSON.parse(JSON.stringify(response[responseKeys[0]]));
    else
      value = JSON.parse(JSON.stringify(response));

    return { value };
  }

  private request() {
    let realUrl = new URL(this.url);

    for (let key in this.searchParams) {
      //am pus asa ca sa converteasca totul in string, chiar si null si undefined => "null" si "undefined"
      let value = "" + this.searchParams[key]
      realUrl.searchParams.append(key, value);
    }

    //switch pe this.method
    switch (this.method) {
      case "get":
        return this.http.get(realUrl.href);
      case "post":
        return this.http.post(realUrl.href, this.requestBody);
    }
  }

  /// data = { value: any, message: string }
  /// daca data.value = null valoarea din model va ramane cea default
  private DataToModel(data) {
    this.model.Reset();

    if (data['message']) {
      this.model.message = data['message'];
    }
    if (data['value']) {
      this.model.value = data['value'];
    }
  }
  // error:String = "lorem ipsum"
  private ErrorToModel(error) {
    this.model.Reset();
    this.model.message = error;
    this.model.hasError = true;

  }

  private handleError(error: any) {
    console.log("Error.: ", error);
    //daca este o eroare declansata de catre mine si nu de catre request.(Va contine mesajul)
    if ((typeof error) === "string")
      return throwError(error);

    return throwError(this.messages.generalError);
  }
}
