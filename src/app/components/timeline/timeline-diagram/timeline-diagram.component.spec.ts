import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimelineDiagramComponent } from './timeline-diagram.component';

describe('TimelineDiagramComponent', () => {
  let component: TimelineDiagramComponent;
  let fixture: ComponentFixture<TimelineDiagramComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimelineDiagramComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TimelineDiagramComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
