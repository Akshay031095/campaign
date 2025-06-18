import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { InsertTemplateComponent } from './insert-template.component';

describe('InsertTemplateComponent', () => {
  let component: InsertTemplateComponent;
  let fixture: ComponentFixture<InsertTemplateComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ InsertTemplateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InsertTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
