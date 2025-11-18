import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BufferBlockComponent } from './buffer-block.component';

describe('BufferBlockComponent', () => {
  let component: BufferBlockComponent;
  let fixture: ComponentFixture<BufferBlockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BufferBlockComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BufferBlockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
