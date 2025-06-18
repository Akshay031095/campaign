import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MultipleSuggestionsComponent } from './multiple-suggestions.component';

describe('MultipleSuggestionsComponent', () => {
  let component: MultipleSuggestionsComponent;
  let fixture: ComponentFixture<MultipleSuggestionsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MultipleSuggestionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MultipleSuggestionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
