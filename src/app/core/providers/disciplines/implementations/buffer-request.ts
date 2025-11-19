import {BufferingDiscipline} from '@app/models/disciplines';

export const bufferRequest: BufferingDiscipline = (request, buffer) => {
  buffer.insert(request);
  return request;
}
