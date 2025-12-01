import {RejectionDiscipline} from '@app/models/disciplines';
import {Request} from '@app/models/objects';

export const rejectRequest: RejectionDiscipline = (request, buffer, time) => {
  const { requests } = buffer;

  const rejectedRequest = requests.reduce((rejectedRequest, currentRequest) =>
    currentRequest.bufferArrivalTime! > rejectedRequest.bufferArrivalTime!
      ? currentRequest
      : rejectedRequest
  );

  buffer.replace(rejectedRequest, request, time);
  return rejectedRequest;
}
