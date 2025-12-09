import {Buffer, Request} from '@app/models';

export type RequestSelectionDiscipline = (buffer: Buffer, request: Request | undefined, time: number) => Request | null;
