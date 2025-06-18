import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ImportBlacklistContactsComponent } from './import-blacklist-contacts.component';

describe('ImportBlacklistContactsComponent', () => {
  let component: ImportBlacklistContactsComponent;
  let fixture: ComponentFixture<ImportBlacklistContactsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ImportBlacklistContactsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportBlacklistContactsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
