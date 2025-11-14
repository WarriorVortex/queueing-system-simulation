import {Request, Buffer} from '@app/models';

export type BufferingDiscipline = (request: Request, buffer: Buffer) => Request;
