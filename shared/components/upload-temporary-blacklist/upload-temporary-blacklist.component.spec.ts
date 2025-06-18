import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { UploadTemporaryBlacklistComponent } from './upload-temporary-blacklist.component';

describe('UploadTemporaryBlacklistComponent', () => {
  let component: UploadTemporaryBlacklistComponent;
  let fixture: ComponentFixture<UploadTemporaryBlacklistComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ UploadTemporaryBlacklistComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UploadTemporaryBlacklistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
