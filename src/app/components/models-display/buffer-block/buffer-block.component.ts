import {ChangeDetectionStrategy, Component, input} from '@angular/core';
import {Buffer} from '@app/models';
import {FormatRequestPipe} from '@app/pipes';

type BufferCell = typeof Buffer.prototype.queue;

@Component({
  selector: 'app-buffer-block',
  imports: [
    FormatRequestPipe
  ],
  templateUrl: './buffer-block.component.html',
  styleUrl: './buffer-block.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BufferBlockComponent {
  bufferCells = input.required<BufferCell>();
}
