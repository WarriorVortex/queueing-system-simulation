import {Request} from '@app/models';
import {FormatMessageConfig} from './simulation-message.types';
import {SpecialSimulationEvent} from '../events/types';

const DefaultFormatMessage: FormatMessageConfig = {
  'buffering': event => {
    const { request } = event;
    return `Заявка ${formatRequest(request)} отправлена в буфер`;
  },
  'requestGeneration': event => {
    const { generated } = event;
    const { sourceId, arrivalTime } = generated;
    return `И${sourceId} сгенерировал заявку ${formatRequest(generated)} (прибытие в t=${arrivalTime})`;
  },
  'rejection': event => {
    const { rejected } = event;
    return `Заявка ${formatRequest(rejected)} получила отказ в обслуживании`;
  },
  'serviceStart': event => {
    const { id, servicedRequest, serviceEndTime } = event.device;
    const formattedRequest = formatRequest(servicedRequest!);
    return `П${id} начал обслуживание заявки ${formattedRequest} (освободится в t=${serviceEndTime!})`;
  },
  'deviceRelease': event => {
    const { device } = event;
    const { id, isFree } = device;
    let message = `П${id} завершил обслуживание`;
    if (isFree) {
      message += ` и отправлен в простой`;
    }
    return `${formatStepInfo(event)} ${message}`;
  },
  'requestAppearance': event => {
    const { request } = event;
    const { sourceId } = request;
    return `${formatStepInfo(event)} Заявка ${formatRequest(request)} поступила от И${sourceId}`;
  },
  'simulationEnd': event => `${formatStepInfo(event)} Конец моделирования`,
}
export default DefaultFormatMessage;

function formatRequest(request: Request) {
  const { id, sourceId } = request;
  return `${sourceId}-${id}`;
}

function formatStepInfo(event: SpecialSimulationEvent) {
  const { step = '?', time } = event;
  return `Шаг ${step} (t=${time}):`;
}
