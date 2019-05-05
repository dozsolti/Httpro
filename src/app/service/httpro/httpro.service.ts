import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { HttproModel } from './httpro.model';

import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export enum BodyTypes { JSON, FORMDATA };
@Injectable({
  providedIn: 'root'
})
export class Httpro {
  private url = "";
  private method = "";

  private searchParams = {};
  private requestHeaders = new HttpHeaders();
  private requestBody = {};
  private requestBodyType: BodyTypes = BodyTypes.JSON;
  private files = [];

  private model: HttproModel = null;

  private messages = {
    loading: "Loading...",
    empty: "No results",
    generalError: "Ceva nu a mers bine",
  }

  constructor(private http: HttpClient) { }

  //#region Request core
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

    this.searchParams = {};
    this.requestHeaders = new HttpHeaders();
    this.requestBody = {};
    this.model = null;
    this.requestBodyType = BodyTypes.JSON;
    this.files = [];
  }

  private request() {
    let realUrl = new URL(this.url);

    for (let key in this.searchParams) {
      //am pus asa ca sa converteasca totul in string, chiar si null si undefined => "null" si "undefined"
      let value = "" + this.searchParams[key]
      realUrl.searchParams.append(key, value);
    }

    if (this.files.length > 0)
      this.requestBodyType = BodyTypes.FORMDATA;
    let body = this.GetRealBody();
    //switch pe this.method
    switch (this.method) {
      case "get":
        return this.http.get(realUrl.href, { headers: this.requestHeaders, observe: 'response' });
      case "post":
        return this.http.post(realUrl.href, body, { headers: this.requestHeaders, observe: 'response' });
    }
  }
  //#endregion

  //#region Request content
  public query(query) {
    this.searchParams = { ...query };
    return this;
  }
  public body(body: Object) {
    this.requestBody = { ...body };
    return this;
  }
  public bodyType(type: BodyTypes) {
    this.requestBodyType = type;
    return this;
  }
  public file(fileName, file) {
    if (file) {
      let i = this.files.findIndex(a => a.fileName === fileName);
      if (i > -1) {
        this.files[i].file = file;
      } else {
        this.files.push({
          fileName,
          file
        });
      }
    }
    return this;
  }
  public headers(headers) {
    for (let key in headers) {
      //am pus asa ca sa converteasca totul in string, chiar si null si undefined => "null" si "undefined"
      let value = "" + headers[key];
      this.requestHeaders.set(key, value);
    }
    return this;
  }
  //Daca nu parametrul este null se va lua din localStorage
  public useToken(token = null) {
    let _token;
    if (token === null)
      _token = localStorage.getItem("idToken");
    else
      _token = token;

    this.requestHeaders.append("Autorization", `Bearer ${_token}`);

    return this;
  }
  //#endregion

  to(model: HttproModel) {

    this.model = model;
    return this;
  }

  exec() {
    return new Promise(resolve => {
      return new Observable(observer => {

        observer.next({ message: this.messages.loading, status: "loading" });

        this.request()
          .subscribe(
            response => {

              let body = response.body || {};

              let bodyKeys = Object.keys(body);
              //empty result
              if (bodyKeys.length === 0) {
                observer.next({ message: this.messages.empty, status: "completed" });
                return;
              }

              observer.next(this.DataFromReponse(body))

            },
            err => observer.error(err),
            () =>
              observer.complete()
          );

      })
        .pipe(catchError(error => this.handleError(error)))
        .subscribe(
          data => { this.DataToModel(data) },
          error => { this.ErrorToModel(error) },
          () => {
            resolve(true);
          }
        );
    });
  }

  //#region Response proccessing functions
  private GetRealBody() {

    if (this.requestBodyType === BodyTypes.JSON)
      return this.requestBody;

    //Momentan exista doar 2 tipuri, JSON si FORMDATA deci e ori una ori alta
    let body = new FormData();
    this.buildFormData(body, this.requestBody);
    for (let file of this.files) {
      body.append(file.fileName, file.file);
    }
    return body;
  }
  buildFormData(formData, data, parentKey = null) {
    if (data && typeof data === 'object' && !(data instanceof Date) && !(data instanceof File)) {
      Object.keys(data).forEach(key => {
        this.buildFormData(formData, data[key], parentKey ? `${parentKey}[${key}]` : key);
      });
    } else {
      const value = data == null ? '' : data;

      formData.append(parentKey, value);
    }
  }

  //Functioneaza pe responseuri cu date si cu sau fara campul de status
  private DataFromReponse(response) {
    let hasSuccessed = true; //se incepe cu true si daca requestul are date(in result sau status code) care spune ca e false se va schimba
    let hasError = false;
    let responseKeys = Object.keys(response);

    let value = null;
    //model contine tot in afara se campul de status
    if (responseKeys.indexOf('status') > -1) {
      if (response['status'] !== 'success')
        hasSuccessed = false;
      if (response['status'] === 'error')
        hasError = true;
      delete response['status'];
      responseKeys.splice(responseKeys.indexOf('status'), 1);

    }

    //Daca responseul este doar un singur camp nu are rost ca value sa contina parentul. Ex. Daca responseul este { articles : [a,b,c] } atunci values va contine doar [a,b,c], fara articles
    //Folosesc clasa JSON pentru a crea o clona a obiectului reponse
    if (responseKeys.length === 1)
      value = JSON.parse(JSON.stringify(response[responseKeys[0]]));
    else
      value = JSON.parse(JSON.stringify(response));

    if (hasSuccessed)
      return { value, hasError: hasError, status: "completed" };
    else
      return { message: value, hasError: hasError, status: "completed" };
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
    if (data['hasError']) {
      this.model.hasError = data['hasError'];
    }

    if (data['status']) {
      let status = data['status'];
      if (status === "loading")
        this.model.isLoading = true;
      else if (status === "completed")
        this.model.isLoading = false;
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
  //#endregion
}
