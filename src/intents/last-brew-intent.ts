import { Handler } from 'alexa-sdk';
import * as moment from 'moment';

import { PicoBrewServiceFactory } from '../picobrew-service';
import { IMachineInfo } from '../picobrew/index';
import { intentHelpers } from './intent-helpers';
import { config } from '../config';
import { log } from '../common/log';

export function LastBrewIntent(this: Handler) {

    const service = PicoBrewServiceFactory.createService();

    service.login(config.picobrew.auth.user, config.picobrew.auth.pass)
        .then(() => {
            return service.getMachines();
        })
        .then((machines: IMachineInfo[]) => {
            // TODO: encapsulate getting the machine somehow
            log.info('Machines:', machines);

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
            log.info('Machine State:', status);

            if (typeof status === 'string') {
                return status;
            }
            if (!status) {
                // TODO: better error handling concept
                return 'No Machine Information Retrieved';
            }
            var session = status.activeSession;
            if (session) {
                return 'Didn\'t you know? ' + intentHelpers.getBrewDescriptionFromSession(session);
            }

            const lastBrewInEnglish = intentHelpers.toEnglishCalendarTime(status.lastBrewStart);
            return `The last time you brewed was ${lastBrewInEnglish}`;
        })
        .then((msg: string) => {
            this.emit(':tell', msg);
        })
        .catch((reason: any) => {
            this.emit(':tell', `An Error Occurred: ${reason}`);
        });
}
