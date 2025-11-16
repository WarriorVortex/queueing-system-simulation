import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DevicesBlockComponent } from './devices-block.component';

describe('BufferBlockComponent', () => {
  let component: DevicesBlockComponent;
  let fixture: ComponentFixture<DevicesBlockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DevicesBlockComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DevicesBlockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
