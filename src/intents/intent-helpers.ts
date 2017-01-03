import { ISession } from '../picobrew/session.interface';
import * as moment from 'moment';

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
    },
    toEnglishCalendarTime: (dateTime: string): string => {
        const momentCalendarOptions: moment.CalendarSpec = {
            sameDay: '[Today at] LT',
            nextDay: '[Tomorrow at] LT',
            nextWeek: 'dddd', // Not used because "last brewed" is in the past
            lastDay: '[Yesterday at] LT',
            lastWeek: '[Last] dddd [at] LT',
            sameElse: 'LL [at] LT'
        };
        return moment(dateTime).calendar(null, momentCalendarOptions);
    },
    compareSessionsByStartTimeDescending: (left: ISession, right: ISession): number => {
        var leftTime = moment(left.startTime);
        var rightTime = moment(right.startTime);

        // NOTE: descending order
        let result: number = 0;
        if(leftTime > rightTime) {
            result = -1;
        }
        else if (leftTime < rightTime) {
            result = 1;
        }

        return result;
    }

};