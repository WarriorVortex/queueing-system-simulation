import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimelineAxisComponent } from './timeline-axis.component';

describe('TimelineAxisComponent', () => {
  let component: TimelineAxisComponent;
  let fixture: ComponentFixture<TimelineAxisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimelineAxisComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TimelineAxisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
