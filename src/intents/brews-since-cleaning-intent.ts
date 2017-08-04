import { Handler } from 'alexa-sdk';
import * as moment from 'moment';

import { PicoBrewServiceFactory } from '../picobrew-service';
import { ISession } from '../picobrew';
import { intentHelpers } from './intent-helpers';
import { config } from '../config';
import { log } from '../common/log';

export function BrewsSinceCleaningIntent(this: Handler) {

    const service = PicoBrewServiceFactory.createService();

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

            // Special case: Pico doesn't record 'Cleaning' sessions in PicoSession API; just report brews since last clean here
            // If Pico sessions exist, just assume Pico. This needs fixes for multi-machine configuration.
            var picoSessions = sessions.filter((sess) => sess.machineType === 'Pico');
            if(picoSessions.length !== 0) {
                picoSessions.sort(intentHelpers.compareSessionsByStartTimeDescending);

                return service.getMachines()
                    .then(function(machines) {
                        // machines should never be 0 here, unless user deregisters, I guess. Check anyway.
                        if(machines.length === 0) {
                            return 'No machines were found';
                        }

                        let brewsUntilClean = machines[0].maxBrewsBeforeClean - machines[0].brewsSinceLastClean;
                        let brewPlurality = brewsUntilClean == 1 ? 'brew' : 'brews';

                        return 'You last cleaned ' + machines[0].brewsSinceLastClean + ' brews ago. You will need to clean in ' + brewsUntilClean + ' ' + brewPlurality;
                    })
            }

            // remove rinses
            var noRinses = sessions.filter((sess) => sess.brewType !== 'Rinse');

            // sort by start time
            noRinses.sort(intentHelpers.compareSessionsByStartTimeDescending);

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
