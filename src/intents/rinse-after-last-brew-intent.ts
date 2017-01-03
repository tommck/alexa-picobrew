import { Handler } from 'alexa-sdk';
import * as moment from 'moment';

import { PicoBrewServiceFactory } from '../picobrew-service';
import { ISession } from '../picobrew';
import { intentHelpers } from './intent-helpers';
import { config } from '../config';
import { log } from '../common/log';

export function RinseAfterLastBrewIntent(this: Handler) {

    const service = PicoBrewServiceFactory.createService();

    service.login(config.picobrew.auth.user, config.picobrew.auth.pass)
        .then(() => {
            return service.getSessionHistory();
        })
        .then((sessions: ISession[]) => {
            // TODO: encapsulate getting the machine somehow
            log.info('Sessions:', sessions);

            if (sessions.length === 0) {
                return 'You have never brewed on this machine';
            }

            // sort by start time
            sessions.sort(intentHelpers.compareSessionsByStartTimeDescending);

            // find the last brew
            let brewIndex = sessions.findIndex((sess) => sess.brewType === 'Brewing');
            if (brewIndex === -1) {
                return 'You have never brewed on this machine';
            }
            if (brewIndex === 0) {
                if (sessions[0].isActive) {
                    let output: string = 'You are brewing now. ';

                    if (sessions.length > 1) {
                        // brewing now, get the last brew before that and check
                        brewIndex = sessions.slice(1).findIndex((sess) => sess.brewType === 'Brewing');
                        if (brewIndex != -1) {
                            switch (sessions[brewIndex - 1].brewType) {
                                case 'Rinse':
                                    output += 'Though after your previous brew you did. ';
                                    break;

                                case 'Cleaning':
                                    output += 'Though after your previous brew you cleaned. ';
                                    break;

                                default:
                                    output += 'Though after your previous brew you did NOT. ';

                            }
                        }
                    }

                    output += 'Don\'t forget to rinse this time!';

                    return output;
                }
            }
            else {
                switch (sessions[brewIndex - 1].brewType) {
                    case 'Rinse':
                        return 'Yes, you did';

                    case 'Cleaning':
                        return 'No you didn\'t, but you cleaned, so you\'re OK';
                }
            }

            return 'No, You did NOT rinse after your last brew';
        })
        .then((msg: string) => {
            this.emit(':tell', msg);
        })
        .catch((reason: any) => {
            this.emit(':tell', `An Error Occurred: ${reason}`);
        });
}
