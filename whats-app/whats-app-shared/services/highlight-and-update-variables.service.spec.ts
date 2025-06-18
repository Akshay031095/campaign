import { TestBed } from '@angular/core/testing';

import { HighlightAndUpdateVariablesService } from './highlight-and-update-variables.service';

describe('HighlightAndUpdateVariablesService', () => {
  let service: HighlightAndUpdateVariablesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HighlightAndUpdateVariablesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
