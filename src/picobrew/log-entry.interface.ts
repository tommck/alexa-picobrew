import { Moment } from 'moment';

export interface ILogEntry {
    dateTime: Moment,
    newStepName: string, // only present on change
    wortTemp: number,
    note: string
}