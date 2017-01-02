import { Handler } from 'alexa-sdk';

import { PicoBrewServiceFactory } from '../picobrew-service';
import { IMachineInfo } from '../picobrew/index';

import { intentHelpers } from './intent-helpers';

export function StatusIntent(this: Handler) {

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
            return intentHelpers.getBrewDescriptionFromSession(status.activeSession);
        })
        .then((msg: string) => {
            this.emit(':tell', msg);
        })
        .catch((reason: any) => {
            this.emit(':tell', `An Error Occurred: ${reason}`);
        });
}
