import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SourcesStatsBlockComponent } from './sources-stats-block.component';

describe('SourcesStatsBlockComponent', () => {
  let component: SourcesStatsBlockComponent;
  let fixture: ComponentFixture<SourcesStatsBlockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SourcesStatsBlockComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SourcesStatsBlockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
