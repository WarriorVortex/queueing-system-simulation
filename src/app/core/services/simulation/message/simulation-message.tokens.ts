import {InjectionToken} from '@angular/core';
import DefaultFormatMessage from './default-format-message.config';
import {FormatMessageConfig} from './simulation-message.types';

export const FORMAT_MESSAGE_CONFIG = new InjectionToken<Partial<FormatMessageConfig>>(
  'FORMAT_MESSAGE_CONFIG',
  {
    factory: () => DefaultFormatMessage
  }
);
