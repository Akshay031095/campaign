import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MessageClassificationComponent } from './message-classification.component';

describe('MessageClassificationComponent', () => {
  let component: MessageClassificationComponent;
  let fixture: ComponentFixture<MessageClassificationComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MessageClassificationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MessageClassificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
