import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MultipleScheduleComponent } from './multiple-schedule.component';

describe('MultipleScheduleComponent', () => {
  let component: MultipleScheduleComponent;
  let fixture: ComponentFixture<MultipleScheduleComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MultipleScheduleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MultipleScheduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
