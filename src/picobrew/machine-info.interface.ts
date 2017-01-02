import { GUID } from './common';
import { ISession } from './session.interface';

/**
 * Description of a PicoBrew machine
 */
export interface IMachineInfo {
    id: number;
    type: 'Zymatic' | 'Pico';
    firmware: string;
    alias: string; // user ID?
    state: string;
    updateAvailable: boolean;
    brewsSinceLastClean: number;
    lastBrewStart: string; // ISO date/time ending in Z
    activeSession: ISession;
    serialNumber: any;
    manufactureDate: string; // ISO date/time ending in Z
    picoErrorsDict: any;
    maxBrewsBeforeClean: number;
}

