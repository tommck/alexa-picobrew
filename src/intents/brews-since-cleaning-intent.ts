import { Handler } from 'alexa-sdk';
import * as moment from 'moment';

import { PicoBrewServiceFactory } from '../picobrew-service';
import { ISession } from '../picobrew';
import { intentHelpers } from './intent-helpers';
import { config } from '../config';
import { log } from '../common/log';

export function BrewsSinceCleaningIntent(this: Handler) {

    const service = PicoBrewServiceFactory.createService();

    function compareSessionsByStartTime(left: ISession, right: ISession): number {
        var leftTime = moment(left.startTime);
        var rightTime = moment(right.startTime);

        // NOTE: descending order
        let result: number = 0;
        if (leftTime > rightTime) {
            result = -1;
        }
        else if (leftTime < rightTime) {
            result = 1;
        }

        return result;
    }

    service.login(config.picobrew.auth.user, config.picobrew.auth.pass)
        .then(() => {
            return service.getSessionHistory();
        })
        .then((sessions: ISession[]) => {
            // TODO: encapsulate getting the machine somehow
            log.info('Sessions:', sessions);

            if (sessions.length === 0) {
                return 'You have never cleaned or brewed on this machine';
            }

            // remove rinses
            var noRinses = sessions.filter((sess) => sess.brewType !== 'Rinse');

            // sort by start time
            noRinses.sort(compareSessionsByStartTime);

            // find the first cleaning
            let cleaningIndex = noRinses.findIndex((sess) => sess.brewType === 'Cleaning');
            if (cleaningIndex === -1) {
                return 'You have never cleaned this machine';
            }

            const cleaningSession = noRinses[cleaningIndex];
            const cleaningDateTiem = cleaningSession.startTime;

            const timesText = (cleaningIndex === 1) ? 'one time' : `${cleaningIndex} times`;

            return `You last cleaned ${intentHelpers.toEnglishCalendarTime(cleaningDateTiem)}. You have brewed ${timesText} since then`;
        })
        .then((msg: string) => {
            this.emit(':tell', msg);
        })
        .catch((reason: any) => {
            this.emit(':tell', `An Error Occurred: ${reason}`);
        });
}
