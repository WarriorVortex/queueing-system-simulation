import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LogBlockComponent } from './log-block.component';

describe('LogBlockComponent', () => {
  let component: LogBlockComponent;
  let fixture: ComponentFixture<LogBlockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LogBlockComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LogBlockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
