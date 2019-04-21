import { TestBed } from '@angular/core/testing';

import { Httpro } from './httpro.service';

describe('HttlService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: Httpro = TestBed.get(Httpro);
    expect(service).toBeTruthy();
  });
});
