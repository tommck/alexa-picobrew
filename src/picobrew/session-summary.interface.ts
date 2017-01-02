import { GUID } from './common';

/**
 * Summary of a brew session
 */
export interface ISessionSummary {
    name: string;
    dateTime?: Date; // TODO: how to get this?
    sessionId: GUID;
    description: string;
    ibu: string;
    srm: string;
    style: string;
    og: string;
}
