import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OverallReport } from './overall-report';

describe('OverallReport', () => {
  let component: OverallReport;
  let fixture: ComponentFixture<OverallReport>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OverallReport]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OverallReport);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
