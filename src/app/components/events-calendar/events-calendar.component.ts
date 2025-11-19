import {ChangeDetectionStrategy, Component, input} from '@angular/core';
import {Device, Source} from '@app/models';
import {DecimalPipe} from '@angular/common';

@Component({
  selector: 'app-events-calendar',
  imports: [
    DecimalPipe
  ],
  templateUrl: './events-calendar.component.html',
  styleUrl: './events-calendar.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventsCalendarComponent {
  sources = input<Source[]>([]);
  devices = input<Device[]>([]);
}
