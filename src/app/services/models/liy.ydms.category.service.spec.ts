import { TestBed } from '@angular/core/testing';

import { LiyYdmsCategoryService } from './liy.ydms.category.service';

describe('LiyYdmsCategoryService', () => {
  let service: LiyYdmsCategoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LiyYdmsCategoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
