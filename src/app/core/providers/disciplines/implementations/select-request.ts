import {Request} from '@app/models/objects'
import {RequestSelectionDiscipline} from '@app/models/disciplines';

export const selectRequest: RequestSelectionDiscipline = (buffer, request?) => {
  const { requests } = buffer;
  if (requests.length === 0 && request !== undefined) {
    requests.push(request);
  }

  if (requests.length === 0) {
    return null;
  }

  let selectedRequest = requests[0];
  for (const elem of requests.slice(1)) {
    if (comparePriority(selectedRequest, elem) > 0) {
      selectedRequest = elem;
    }
  }

  return selectedRequest;
}

function comparePriority(first: Request, second: Request): number {
  if (first.sourceId !== second.sourceId) {
    return first.sourceId - second.sourceId;
  }

  if (second.bufferArrivalTime! > first.bufferArrivalTime!) {
    return second.bufferArrivalTime! - first.bufferArrivalTime!;
  }

  return -1;
}
