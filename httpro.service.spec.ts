import { TestBed, inject } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { HttpClientModule } from '@angular/common/http';

import { HTTPro } from './httpro.service';
import { HTTProConfig } from './httpro.config';
import { HTTProModel } from './httpro.model';


describe('HTTPro initializer', () => {
  let service: HTTPro;
  beforeEach(() => {
    TestBed.resetTestEnvironment();

    TestBed.initTestEnvironment(
      BrowserDynamicTestingModule,
      platformBrowserDynamicTesting()
    );

    TestBed.configureTestingModule({
      imports: [
        HttpClientModule
      ], providers: [HTTPro]
    });
    service = TestBed.get(HTTPro);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
    expect(service.model).toBeNull();
  });

  //ToDo:
  //it('should import the Config json', ()=>{ })

  //ToDo:
  //it('should import the Model class', ()=>{ })
});

describe('HTTPro Gets', () => {
  let service: HTTPro;
  beforeEach(() => {
    TestBed.resetTestEnvironment();

    TestBed.initTestEnvironment(
      BrowserDynamicTestingModule,
      platformBrowserDynamicTesting()
    );

    TestBed.configureTestingModule({
      imports: [
        HttpClientModule
      ], providers: [HTTPro]
    });
    service = TestBed.get(HTTPro);
  });

  it('should be create the request object correctly', () => {
    service
      .get('/posts');

    expect(service.request).not.toBeNull();

    expect(service.request.method).toBe("get");
    expect(service.request.url).toBe(HTTProConfig.baseURL + '/posts');
  });

  it('should set the model', () => {
    let model = new HTTProModel(null);
    service
      .get('/posts')
      .to(model);

    expect(service.model).toEqual(model);
  });

  /* it('should make the request to json sample', async () => {
     let model = new HTTProModel(null);
     await service
       .get('https://jsonplaceholder.typicode.com/posts')
       .to(model)
       .exec()
     console.log(model.toDebugJSON());
     expect(true).toBe(true);
   });
 
   it('should make the request to mindtrip (CROS)', async () => {
     let model = new HTTProModel(null);
     await service
       .get('https://mindtrip.ro/api/settings/')
       .to(model)
       .exec()
       .then((hasSucced)=>{
         console.log({hasSucced})
       })
       .catch(err=>{
         console.log({err})
       }).finally(()=>{
         console.log(model.toDebugJSON());
         expect(true).toBe(true);
       })
   });*/
   
   it('should handle status codes', async () => {
    let model = new HTTProModel();
    await service
      .get('http://portal.replybee.ro/api/hola',true)
      .to(model)
      .exec()

      console.log(model.toDebugJSON());
    expect(model.hasError).toBe(true);
  });

  it('should warn about unexisting model', async () => {
    let hasError = false;
    await service
      .get('/post')
      .OnError((error) => {
        hasError = true;
      })
      .exec()

    expect(hasError).toBe(true);
  });

  it('should warn OnError', async () => {
    let hasError = false;
    await service
      .OnError((error) => {
        hasError = true;
      })
      .exec()

    expect(hasError).toBe(true);
  });
  it('should call the callback', async () => {
    let itStarted = false;
    let model = new HTTProModel(null);
    await service
      .get('/posts')
      .to(model)
      .OnStart(() => {
        itStarted = true;
      })
      .exec()

    expect(itStarted).toBe(true);
  });
  it('should be able the make request consecutivly', async () => {
    let modelPosts = new HTTProModel(null);
    let modelUser = new HTTProModel({});

    await service
      .get('https://jsonplaceholder.typicode.com/posts', true)
      .to(modelPosts)
      .exec()

    await service
      .get('https://jsonplaceholder.typicode.com/users/1', true)
      .to(modelUser)
      .exec()
    expect(modelUser).not.toBe(modelPosts);
  });
})

/*
describe('HTTPro Post', () => {
  let service: HTTPro;
  beforeEach(() => {
    TestBed.resetTestEnvironment();

    TestBed.initTestEnvironment(
      BrowserDynamicTestingModule,
      platformBrowserDynamicTesting()
    );

    TestBed.configureTestingModule({
      imports: [
        HttpClientModule
      ], providers: [HTTPro]
    });
    service = TestBed.get(HTTPro);
  });

  it('should create a post', () => {
    let model = new HTTProModel();
    service
      .post('/posts')
      .headers({ 'Content-type': "application/json; charset=UTF-8" })
      .body({
        title: 'foo',
        body: 'bar',
        userId: 1
      })
      .to(model)
      .map((response) => {
        console.log({response});
        return [42, response];
      })
      .OnSuccess(()=>{
        console.log(model.toDebugJSON())
      })
      .exec()

    expect(service.request).not.toBeNull();

  });

})*/