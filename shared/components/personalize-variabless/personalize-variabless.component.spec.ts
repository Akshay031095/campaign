import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PersonalizeVariablessComponent } from './personalize-variabless.component';

describe('PersonalizeVariablessComponent', () => {
  let component: PersonalizeVariablessComponent;
  let fixture: ComponentFixture<PersonalizeVariablessComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PersonalizeVariablessComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PersonalizeVariablessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
