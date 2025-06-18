import { TestBed } from '@angular/core/testing';

import { UpdateShortUrlVariablesService } from './update-short-url-variables.service';

describe('UpdateShortUrlVariablesService', () => {
  let service: UpdateShortUrlVariablesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UpdateShortUrlVariablesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
