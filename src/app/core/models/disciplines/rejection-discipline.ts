import { Request } from "../request";
import { Buffer } from "../buffer";

export type RejectionDiscipline = (request: Request, buffer: Buffer) => Request;
