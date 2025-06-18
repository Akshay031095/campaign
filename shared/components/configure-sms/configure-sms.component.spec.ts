import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigureSmsComponent } from './configure-sms.component';

describe('ConfigureSmsComponent', () => {
  let component: ConfigureSmsComponent;
  let fixture: ComponentFixture<ConfigureSmsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConfigureSmsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfigureSmsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
