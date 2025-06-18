import { TestBed } from '@angular/core/testing';

import { ResetVariablesService } from './reset-variables.service';

describe('ResetVariablesService', () => {
  let service: ResetVariablesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ResetVariablesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
