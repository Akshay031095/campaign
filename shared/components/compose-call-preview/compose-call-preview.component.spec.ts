import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ComposeCallPreviewComponent } from './compose-call-preview.component';

describe('ComposeCallPreviewComponent', () => {
  let component: ComposeCallPreviewComponent;
  let fixture: ComponentFixture<ComposeCallPreviewComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ComposeCallPreviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ComposeCallPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
