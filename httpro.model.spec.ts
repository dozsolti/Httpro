
import { HTTProModel } from './httpro.model';
import { inject, TestBed } from '@angular/core/testing';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { HTTPro } from './httpro.service';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';

describe('HTTProModel', () => {
  let model: HTTProModel;
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
    model = new HTTProModel(3);
  });

  it('should be created', () => {
    expect(model).toBeTruthy();
  });

  it('should reset the value', () => {
    model.ResetValue();
    expect(model.value).toEqual(model.initialValue);
  });

  it('should be reset everything to initial/default', () => {
    model.Reset();
    expect(model.value).toEqual(model.initialValue);
    expect(model.message).toEqual(model.initialMessage);

    expect(model.isWaiting).toBe(true);
    expect(model.isLoading).toBe(false);

    expect(model.isDone).toBe(false);
    expect(model.hasError).toBe(false);
    expect(model.hasSucced).toBe(false);
  });

  it('should return the correct status', () => {
    let status = model.GetStatus();
    expect(status).not.toBe("");

    if (model.isWaiting)
      expect(status).toEqual("waiting");
    if (model.isLoading)
      expect(status).toEqual("loading");
    if (model.hasError)
      expect(status).toEqual("error");
    if (model.hasSucced)
      expect(status).toEqual("success");
  });

  /*it('should mark when is done', inject([HttpClient, HTTPro], async (http, httpro) => {
    let _model = new HTTProModel(null);
    expect(httpro.model.isDone).toBe(false);
    await httpro
      .get('/posts')
      .to(_model)
      .exec();

    expect(httpro.model.isDone).toBe(true);
  }))*/
});
