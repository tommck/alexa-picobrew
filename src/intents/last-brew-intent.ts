import { Handler } from 'alexa-sdk';
import * as moment from 'moment';

import { PicoBrewServiceFactory } from '../picobrew-service';
import { ISession } from '../picobrew/index';
import { intentHelpers } from './intent-helpers';
import { config } from '../config';
import { log } from '../common/log';

/**
 * Looks through the history for a brewing event and then reports on it
 */
export function LastBrewIntent(this: Handler) {

    const service = PicoBrewServiceFactory.createService();

    service.login(config.picobrew.auth.user, config.picobrew.auth.pass)
        .then(() => {
            return service.getSessionHistory();
        })
        .then((sessions: ISession[]) => {
            // TODO: encapsulate getting the machine somehow
            log.info('Sessions:', sessions);

            // sort by start time
            sessions.sort(intentHelpers.compareSessionsByStartTimeDescending);

            // find the last brew
            let brewIndex = sessions.findIndex((sess) => sess.brewType === 'Brewing');
            if (brewIndex === -1) {
                return 'You have never brewed on this machine';
            }
            var session = sessions[brewIndex];
            if (session.isActive) {
                return 'Didn\'t you know? ' + intentHelpers.getBrewDescriptionFromSession(session);
            }

            const lastBrewInEnglish = intentHelpers.toEnglishCalendarTime(session.startTime);
            return `The last time you brewed was ${lastBrewInEnglish}. It was called ${session.beerName}`;
        })
        .then((msg: string) => {
            this.emit(':tell', msg);
        })
        .catch((reason: any) => {
            this.emit(':tell', `An Error Occurred: ${reason}`);
        });
}
