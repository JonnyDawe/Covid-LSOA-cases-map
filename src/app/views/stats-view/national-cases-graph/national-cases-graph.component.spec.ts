import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NationalCasesGraphComponent } from './national-cases-graph.component';

describe('NationalCasesGraphComponent', () => {
  let component: NationalCasesGraphComponent;
  let fixture: ComponentFixture<NationalCasesGraphComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NationalCasesGraphComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NationalCasesGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
