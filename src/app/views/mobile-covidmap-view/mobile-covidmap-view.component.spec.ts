import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MobileCovidmapViewComponent } from './mobile-covidmap-view.component';

describe('MobileCovidmapViewComponent', () => {
  let component: MobileCovidmapViewComponent;
  let fixture: ComponentFixture<MobileCovidmapViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MobileCovidmapViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MobileCovidmapViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
