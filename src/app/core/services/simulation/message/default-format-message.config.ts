import {Request} from '@app/models';
import {FormatMessageConfig} from './simulation-message.tokens';
import {SpecialSimulationEvent} from '../events';

const DefaultFormatMessage: FormatMessageConfig = {
  'buffering': event => {
    const { request } = event;
    return `Заявка ${formatRequest(request)} отправлена в буфер`;
  },
  'requestGeneration': event => {
    const { sourceId, arrivalTime } = event.generated;
    return `Источник ${sourceId} сгенерировал заявку (прибытие в t=${arrivalTime})`;
  },
  'rejection': event => {
    const { rejected } = event;
    return `Заявка ${formatRequest(rejected)} получила отказ в обслуживании`;
  },
  'serviceStart': event => {
    const { id, servicedRequest, serviceEndTime } = event.device;
    const formattedRequest = formatRequest(servicedRequest!);
    return `Прибор ${id} начал обслуживание заявки ${formattedRequest} (освободится в t=${serviceEndTime!})`;
  },
  'deviceRelease': event => {
    const { device } = event;
    const { id, isFree } = device;
    let message = `Прибор ${id} завершил обслуживание`;
    if (isFree) {
      message += ` и отправлен в простой`;
    }
    return message;
  },
  'requestAppearance': event => {
    const { request } = event;
    const { sourceId } = request;
    return `Заявка ${formatRequest(request)} поступила от источника ${sourceId}`;
  },
  'simulationEnd': event => `${formatStepInfo(event)} Конец симуляции`
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
