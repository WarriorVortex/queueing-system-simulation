import {ChangeDetectionStrategy, Component, ElementRef, input, ViewChild} from '@angular/core';
import {takeUntilDestroyed, toObservable} from '@angular/core/rxjs-interop';
import {CdkVirtualScrollViewport, ScrollingModule} from '@angular/cdk/scrolling';
import {debounceTime, distinctUntilChanged} from 'rxjs';

@Component({
  selector: 'app-log-block',
  imports: [
    ScrollingModule
  ],
  templateUrl: './log-block.component.html',
  styleUrl: './log-block.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LogBlockComponent {
  @ViewChild(CdkVirtualScrollViewport) viewport?: CdkVirtualScrollViewport;
  logs = input<string[]>([]);

  constructor() {
    this.createScrollEffect();
  }

  private createScrollEffect() {
    toObservable(this.logs).pipe(
      debounceTime(100),
      takeUntilDestroyed()
    ).subscribe(logs => {
      this.viewport?.scrollToIndex(logs.length - 1, 'instant');
    });
  }
}
