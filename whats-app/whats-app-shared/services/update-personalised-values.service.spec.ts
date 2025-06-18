import { TestBed } from '@angular/core/testing';

import { UpdatePersonalisedValuesService } from './update-personalised-values.service';

describe('UpdatePersonalisedValuesService', () => {
  let service: UpdatePersonalisedValuesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UpdatePersonalisedValuesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
