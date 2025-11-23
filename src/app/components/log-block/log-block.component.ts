import {ChangeDetectionStrategy, Component, ElementRef, input, ViewChild} from '@angular/core';
import {takeUntilDestroyed, toObservable} from '@angular/core/rxjs-interop';
import {ScrollingModule} from '@angular/cdk/scrolling';

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
  @ViewChild('logsList') logsList: ElementRef<HTMLElement> | undefined;
  logs = input<string[]>([]);

  constructor() {
    this.createScrollEffect();
  }

  private createScrollEffect() {
    toObservable(this.logs).pipe(
      takeUntilDestroyed()
    ).subscribe(() => {
      const elem = this.logsList?.nativeElement;
      if (elem) {
        elem.scrollTop = elem.scrollHeight;
      }
    });
  }
}
