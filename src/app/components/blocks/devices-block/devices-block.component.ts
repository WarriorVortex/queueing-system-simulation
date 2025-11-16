import {ChangeDetectionStrategy, Component, input} from '@angular/core';
import {Device} from '@app/models';
import {FormatRequestPipe} from '@app/pipes';

@Component({
  selector: 'app-devices-block',
  imports: [
    FormatRequestPipe
  ],
  templateUrl: './devices-block.component.html',
  styleUrl: './devices-block.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DevicesBlockComponent {
  devices = input.required<Device[]>();
}
