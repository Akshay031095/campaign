import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ViewScheduleComponent } from './view-schedule.component';

describe('ViewScheduleComponent', () => {
  let component: ViewScheduleComponent;
  let fixture: ComponentFixture<ViewScheduleComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewScheduleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewScheduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
