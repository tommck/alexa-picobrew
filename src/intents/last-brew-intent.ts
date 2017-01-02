import { Handler } from 'alexa-sdk';
import * as moment from 'moment';

import { PicoBrewServiceFactory } from '../picobrew-service';
import { IMachineInfo } from '../picobrew/index';
import { intentHelpers } from './intent-helpers';

const momentCalendarOptions: moment.CalendarSpec = {
    sameDay: '[Today at] LT',
    nextDay: '[Tomorrow at] LT',
    nextWeek: 'dddd',
    lastDay: '[Yesterday at] LT',
    lastWeek: '[Last] dddd [at] LT',
    sameElse: 'LL [at] LT'
};

export function LastBrewIntent(this: Handler) {

    const service = PicoBrewServiceFactory.createService();

    service.getMachines()
        .then((machines: IMachineInfo[]) => {
            console.info('Machines:', machines);

            if (machines.length > 1) {
                // TODO: "ask" the user
                return 'more than one machine is not supported';
            }
            if (machines.length === 0) {
                return 'No Machines were found';
            }
            return service.getMachineState(machines[0].id);
        })
        .then((status: IMachineInfo | string) => {
            console.info('Machine State:', status);

            if (typeof status === 'string') {
                return status;
            }
            var session = status.activeSession;
            if (session) {
                return 'Didn\'t you know? ' + intentHelpers.getBrewDescriptionFromSession(session);
            }

            const lastBrewInEnglish = moment(status.lastBrewStart).calendar(null, momentCalendarOptions);
            return `The last brew you did was ${lastBrewInEnglish}`;
        })
        .then((msg: string) => {
            this.emit(':tell', msg);
        })
        .catch((reason: any) => {
            this.emit(':tell', `An Error Occurred: ${reason}`);
        });
}
