import {Buffer} from '../buffer';
import {Request} from '../request';

export type RequestSelectionDiscipline = (buffer: Buffer, request?: Request) => Request;
