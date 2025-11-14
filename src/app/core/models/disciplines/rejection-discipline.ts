import { Request, Buffer } from '@app/models';

export type RejectionDiscipline = (request: Request, buffer: Buffer) => Request;
