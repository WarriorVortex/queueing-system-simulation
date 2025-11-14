import {BufferingDiscipline} from '@app/models/disciplines';

export const bufferRequest: BufferingDiscipline = (request, buffer) => {
  buffer.add(request);
  return request;
}
