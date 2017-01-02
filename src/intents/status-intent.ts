import { Handler } from 'alexa-sdk';

import { PicoBrewServiceFactory } from '../picobrew-service';
import { IMachineInfo } from '../picobrew/index';

import { intentHelpers } from './intent-helpers';

import { log } from '../common/log';

import { config } from '../config';

export function StatusIntent(this: Handler) {

    const service = PicoBrewServiceFactory.createService();

    service.login(config.auth.user, config.auth.pass)
        .then(() => {
            return service.getMachines();
        })
        .then((machines: IMachineInfo[]) => {
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
            return intentHelpers.getBrewDescriptionFromSession(status.activeSession);
        })
        .then((msg: string) => {
            this.emit(':tell', msg);
        })
        .catch((reason: any) => {
            this.emit(':tell', `An Error Occurred: ${reason}`);
        });
}
