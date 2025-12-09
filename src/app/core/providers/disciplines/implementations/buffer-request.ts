import {BufferingDiscipline} from '@app/models/disciplines';

export const bufferRequest: BufferingDiscipline = (request, buffer, time) => {
  buffer.add(request, time);
  return request;
}
