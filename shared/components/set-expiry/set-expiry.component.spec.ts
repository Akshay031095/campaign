import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SetExpiryComponent } from './set-expiry.component';

describe('SetExpiryComponent', () => {
  let component: SetExpiryComponent;
  let fixture: ComponentFixture<SetExpiryComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SetExpiryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SetExpiryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
