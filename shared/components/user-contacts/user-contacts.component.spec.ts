import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { UserContactsComponent } from './user-contacts.component';

describe('UserContactsComponent', () => {
  let component: UserContactsComponent;
  let fixture: ComponentFixture<UserContactsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ UserContactsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserContactsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
