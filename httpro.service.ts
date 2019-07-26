import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { HTTProConfig } from "./httpro.config";
import { HTTProModel } from './httpro.model';
import { HTTProRequest } from './httpro.request';

import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
export enum BodyTypes { JSON, FORMDATA };

/*Todos:
- get Horia's json to formData
*/
@Injectable()
export class HTTPro {

  model: HTTProModel = null;
  request: HTTProRequest = null;
  callbacks = {
    OnStart: null,
    OnResponseGot: null,
    OnEmptyResponse: null,
    OnError: null,
    OnSuccess: null,
  }
  mapFunc = null;
  constructor(private http: HttpClient) { }

  get(url: string, ignoreBaseURl = false) {
    this.CreateRequest('get', url, ignoreBaseURl);
    return this;
  }
  post(url: string, ignoreBaseURl = false) {
    this.CreateRequest("post", url, ignoreBaseURl);
    return this;
  }
  put(url: string, ignoreBaseURl = false) {
    this.CreateRequest("put", url, ignoreBaseURl);
    return this;
  }
  delete(url: string, ignoreBaseURl = false) {
    this.CreateRequest("delete", url, ignoreBaseURl);
    return this;
  }

  private CreateRequest(method, url, ignoreBaseURl = false) {
    let _url = url;
    if (ignoreBaseURl == false)
      _url = HTTProConfig.baseURL + url;
    this.request = new HTTProRequest(method, _url);

    this.callbacks = {
      OnStart: null,
      OnResponseGot: null,
      OnEmptyResponse: null,
      OnError: null,
      OnSuccess: null,
    }
    this.mapFunc = null;
  }

  //#region Request content
  OnStart(func) {
    this.callbacks.OnStart = func;
    return this;
  }
  OnResponseGot(func) {
    this.callbacks.OnResponseGot = func;
    return this;
  }
  OnEmptyResponse(func) {
    this.callbacks.OnEmptyResponse = func;
    return this;
  }
  OnError(func) {
    this.callbacks.OnError = func;
    return this;
  }
  OnSuccess(func) {
    this.callbacks.OnSuccess = func;
    return this;
  }

  query(query) {
    if (this.CheckRequest()) {
      this.request.searchParams = { ...query };
    }
    return this;
  }
  body(body: Object) {
    if (this.CheckRequest()) {
      this.request.body = { ...body };
    }
    return this;
  }
  bodyType(type: BodyTypes) {
    if (this.CheckRequest()) {
      this.request.bodyType = type;
    }
    return this;
  }
  file(fileName, file) {
    if (this.CheckRequest()) {
      if (file) {
        let i = this.request.files.findIndex(a => a.fileName === fileName);
        if (i > -1) {
          this.request.files[i].file = file;
        } else {
          this.request.files.push({
            fileName,
            file
          });
        }
      }
    }
    return this;
  }
  headers(headers: Object) {
    if (this.CheckRequest()) {
      for (let key in headers) {
        //am pus asa ca sa converteasca totul in string, chiar si null si undefined => "null" si "undefined"
        let value = "" + headers[key];
        this.request.headers[key] = value;
      }
    }
    return this;
  }
  //Daca nu parametrul este null se va lua din localStorage
  useToken(token = null) {
    if (this.CheckRequest()) {
      let _token;
      if (token === null)
        _token = localStorage.getItem("token");
      else
        _token = token;

      this.request.headers["Authorization"] = `Bearer ${_token}`;
    }
    return this;
  }
  private CheckRequest() {
    let existsRequest = this.request != null;
    if (existsRequest)
      return true;

    this.logInternalError('no-request');
    return false;
  }
  //#endregion

  map(func) {
    this.mapFunc = func;
    return this;
  }
  to(model: HTTProModel) {
    this.model = model;
    return this;
  }

  private execRequest() {
    let realUrl = new URL(this.request.url);
    for (let key in this.request.searchParams) {
      //am pus asa ca sa converteasca totul in string, chiar si null si undefined => "null" si "undefined"
      let value = "" + this.request.searchParams[key]
      realUrl.searchParams.append(key, value);
    }
    if (this.request.files.length > 0)
      this.request.bodyType = BodyTypes.FORMDATA;
    let body = this.GetRealBody();
    switch (this.request.method) {
      case "get":
        return this.http.get(realUrl.href, { headers: this.request.headers, observe: 'response' });
      case "post":
        return this.http.post(realUrl.href, body, { headers: this.request.headers, observe: 'response' });
      case "put":
        return this.http.put(realUrl.href, body, { headers: this.request.headers, observe: 'response' });
      case "delete":
        return this.http.delete(realUrl.href, { headers: this.request.headers, observe: 'response' });
    }
  }
  private GetRealBody() {

    if (this.request.bodyType === BodyTypes.JSON)
      return this.request.body;

    //Momentan exista doar 2 tipuri, JSON si FORMDATA deci e ori una ori alta
    let body = new FormData();
    this.buildFormData(body, this.request.body);
    for (let file of this.request.files) {
      body.append(file.fileName, file.file);
    }
    return body;
  }

  private buildFormData(formData, data, parentKey = null) {
    if (data && typeof data === 'object' && !(data instanceof Date) && !(data instanceof File)) {
      Object.keys(data).forEach(key => {
        this.buildFormData(formData, data[key], parentKey ? `${parentKey}[${key}]` : key);
      });
    } else {
      const value = data == null ? '' : data;

      formData.append(parentKey, value);
    }
  }
  private CheckValidity() {
    if (this.request == null) {
      this.logInternalError('no-request');
      if (this.callbacks.OnError)
        this.callbacks.OnError("Request wasn't defined");
      return false;
    }
    if (this.model == null) {
      this.logInternalError('no-model');
      if (this.callbacks.OnError)
        this.callbacks.OnError("Model wasn't defined");
      return false;
    }
  }
  exec() {
    return new Promise((resolve, reject) => {
      try {
        if (this.CheckValidity() == false) {
          reject("Invalid HTTPro request");
          return;
        }
        //console.log("callback: OnStart");
        if (this.callbacks.OnStart)
          this.callbacks.OnStart();

        this.model.Reset();
        this.SetModelStatus('loading');
        this.model.message = HTTProConfig.messages.loading;
        this.execRequest()
          .pipe(catchError(error => this.formatError(error)))
          .subscribe(
            (response) => {
              //console.log("callback: OnResponseGot");
              if (this.callbacks.OnResponseGot)
                this.callbacks.OnResponseGot();

              let body = response.body || {};

              let bodyKeys = Object.keys(body);
              //empty result
              if (bodyKeys.length === 0) {
                //console.log("callback: OnEmptyResponse");
                if (this.callbacks.OnEmptyResponse)
                  this.callbacks.OnEmptyResponse();
                this.SetModelStatus('success');
                this.model.message = HTTProConfig.messages.empty;
                return;
              }

              let data = this.ParseBody(body);
              this.model.Reset();

              if (data.hasSucced) {
                this.SetModelStatus("success");
                let value = data.value;
                if (this.mapFunc)
                  value = this.mapFunc(data.value);
                this.model.value = value;
              } else {
                this.SetModelStatus("error");
                this.model.message = data.message;
              }

              //When the request was done.
              //When you're here, you can see if it has errors or not. If it has (from ErrorToModel) it means it wasn't succed

              this.SetModelStatus('success');
              //console.log("callback: OnSuccess");
              if (this.callbacks.OnSuccess)
                this.callbacks.OnSuccess();

              resolve(true);

            },
            error => {
              console.log(error);
              //on error put it in model
              this.ErrorToModel(error);
              //console.log("callback: OnError");
              if (this.callbacks.OnError)
                this.callbacks.OnError(error);
              reject(error);
            }
          );
      } catch (error) {
        this.logInternalError('custom', error);
        reject(error)
      }

    })
  }

  //Functioneaza pe responseuri cu date si cu sau fara campul de status
  private ParseBody(body) {
    let hasSucced = true; //se incepe cu true si daca requestul are date(in result sau status code) care spune ca e false se va schimba
    let responseKeys = Object.keys(body);

    let value = null;
    //model contine tot in afara se campul de status
    if (responseKeys.indexOf('status') > -1) {
      if (body['status'] !== 'success') {
        hasSucced = false;
      }
      delete body['status'];
      responseKeys.splice(responseKeys.indexOf('status'), 1);
    }

    value = { ...body };

    if (hasSucced)
      return { value, hasSucced };
    else
      return { message: value, hasSucced };
  }

  private ErrorToModel(error) {
    this.model.Reset();
    this.model.message = error;
    this.SetModelStatus('error');
  }


  private SetModelStatus(status) {
    this.model.isWaiting = false;
    this.model.isLoading = false;
    this.model.isDone = false;
    this.model.hasError = false;
    this.model.hasSucced = false;

    switch (status) {
      case "waiting":
        this.model.isWaiting = true;
        break;
      case "loading":
        this.model.isLoading = true;
        break;
      case "error":
        this.model.isDone = true;
        this.model.hasError = true;
        break;
      case "success":
        this.model.isDone = true;
        this.model.hasSucced = true;
        break;
    }
  }

  private formatError(error: any) {
    if (HTTProConfig.logTheError)
      console.log("Error.: ", error);

    //daca este o eroare declansata de catre mine si nu de catre request.(Va contine mesajul)
    if (error instanceof String)
      return throwError(error);
    if (error instanceof HttpErrorResponse)
      return throwError(error.statusText)
    return throwError(HTTProConfig.messages.generalError);
  }

  private logInternalError(type: 'no-request' | 'no-model' | 'custom' | 'general' = 'general', customMessage = '') {
    let errors = {
      'no-request': `You have to define the request first.\n Use: .get(url), .post(url), .put(url) or .delete(url)`,
      'no-model': `You have to define the model first.\n Use: .to(model: HTTProModel)`,
      general: 'Something went wrong'
    }
    if (type == 'custom')
      console.error(`HTTPro error: ${customMessage} `)
    else
      console.error(`HTTPro error: ${errors[type]} `)
  }
}
