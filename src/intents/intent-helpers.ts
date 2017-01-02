import { ISession } from '../picobrew/session.interface';

export const intentHelpers = {
    getBrewDescriptionFromSession: (session: ISession): string => {
        if (!session) {
            return 'Your machine is idle';
        }

        let brewingText: string;

        switch (session.brewType) {
            case 'Cleaning':
                brewingText = 'Cleaning';
                break;

            case 'SousVide':
                brewingText = `Cooking ${session.beerName}`;

            default:
                brewingText = `Brewing ${session.beerName}`;
                break;
        }

        let output = `Your machine is currently ${brewingText}. The current step is ${session.stepName}.`;
        if (session.wortTemp > 0) {
            output += `The temperature is ${session.wortTemp}.`;
        }
        return output;
    }
};