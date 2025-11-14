import {RejectionDiscipline} from '@app/models/disciplines';
import {Request} from '@app/models/objects';

export const rejectRequest: RejectionDiscipline = (request, buffer) => {
  const { requests } = buffer;
  let rejectedRequest: Request = requests[0];
  for (const elem of requests.slice(1)) {
    if (compareRejectPriority(rejectedRequest, elem) > 0) {
      rejectedRequest = elem;
    }
  }

  buffer.remove(rejectedRequest);
  buffer.shrink();
  buffer.add(request);

  return rejectedRequest;
}

function compareRejectPriority(first: Request, second: Request): number {
  return first.bufferArrivalTime! - second.bufferArrivalTime!;
}
