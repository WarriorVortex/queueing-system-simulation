import {Pipe, PipeTransform} from '@angular/core';
import {Request} from '@app/models'

@Pipe({
  name: 'formatRequest'
})
export class FormatRequestPipe implements PipeTransform {
  transform(value: Request | undefined | null): string | undefined {
    if (!value) {
      return undefined;
    }

    const { id, sourceId } = value;
    return `${sourceId}-${id}`;
  }
}
