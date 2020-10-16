import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CovidmapViewComponent } from './covidmap-view.component';

describe('CovidmapViewComponent', () => {
  let component: CovidmapViewComponent;
  let fixture: ComponentFixture<CovidmapViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CovidmapViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CovidmapViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
