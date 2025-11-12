import {Request} from '../request';
import {Buffer} from '../buffer';

export type BufferingDiscipline = (request: Request, buffer: Buffer) => Request;
