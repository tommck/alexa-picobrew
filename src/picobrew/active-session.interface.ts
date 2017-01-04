import { GUID } from './common';

/**
 * a brew session
 */
export interface IActiveSession {
    machineId: string;
    guid: GUID;
    firmwareVersion: string;
    srm: number;
    og: number;
    ibu: number;
    tastingNotes: string;
    author: string;
    name: string;
    style: string;
}
