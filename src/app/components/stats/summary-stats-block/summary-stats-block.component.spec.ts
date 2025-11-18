import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SummaryStatsBlockComponent } from './summary-stats-block.component';

describe('SummaryStatsBlockComponent', () => {
  let component: SummaryStatsBlockComponent;
  let fixture: ComponentFixture<SummaryStatsBlockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SummaryStatsBlockComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SummaryStatsBlockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
