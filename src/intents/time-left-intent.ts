import { Handler } from 'alexa-sdk';
import * as moment from 'moment';

import { PicoBrewServiceFactory } from '../picobrew-service';
import { IActiveSession, IMachineInfo, ISession, ILogEntry, IRecipe } from '../picobrew/index';
import { intentHelpers } from './intent-helpers';
import { config } from '../config';
import { log } from '../common/log';

/**
 * Looks through the history for a brewing event and then reports on it
 */
export function TimeLeftIntent(this: Handler) {

    const service = PicoBrewServiceFactory.createService();

    let picobrewUserId: string;
    let productId: string;
    let recipeName: string;
    let currentLogEntry: ILogEntry;
    let stepName: string;
    let stepStartTime: moment.Moment;
    let output: string;

    service.login(config.picobrew.auth.user, config.picobrew.auth.pass)
        .then((userId: string) => {
            log.debug(`logged in user: ${userId}`);
            picobrewUserId = userId;
            return service.getActiveSession(userId);
        })
        .then((session: IActiveSession) => {
            if (!session) {
                return 'You are not currently brewing';
            }

            // Get the current recipe name
            recipeName = session.name;
            productId = session.machineId;

            return service.getCurrentLogEntries(picobrewUserId);
        })
        .then((entries: ILogEntry[] | string) => {
            if (typeof entries === 'string') {
                return entries;
            }
            // get first and last entries and figure out how long it's been
            // " You have been brewing for X minutes"...
            const beginning = entries[0].dateTime;
            currentLogEntry = entries[entries.length - 1];
            const now = currentLogEntry.dateTime;

            var diffInMinutes = now.diff(beginning, 'minutes');

            const diffInEnglish = durationToEnglish(moment.duration(diffInMinutes, 'minutes'));

            // start with this
            output = `You have been brewing for about ${diffInEnglish}.`;

            // find the current step name by starting at the end and looking for a newStepName
            for (let i = entries.length - 1; i > 0; --i) {
                var entry = entries[i];
                if (entry.newStepName) {
                    stepName = entry.newStepName;
                    stepStartTime = entry.dateTime;
                    break;
                }
            }

            if (!stepName) {
                return 'Could not find the current step name';
            }
            log.info('Getting Recipes for the machine');
            // load the recipe to get the steps so we can find the current step
            return service
                .getRecipesForMachine(picobrewUserId, productId);
        })
        .then((recipes: IRecipe[] | string) => {
            if (typeof recipes === 'string') {
                return recipes;
            }
            if (!recipes || recipes.length === 0) {
                return 'Error: No recipes retrieved';
            }

            log.debug(`Looking for recipe ${recipeName}`);
            const recipe = recipes.find((rec) => rec.name === recipeName);
            log.info('Found Recipe:', recipe);

            const remaining: moment.Duration = estimateRemainingTime(recipe, stepName, stepStartTime, currentLogEntry);

            const duration = durationToEnglish(remaining);

            output += ` You have approximately ${duration} left`;
        })
        .then((message?: string) => {
            log.debug(`Output ${output}`);
            if (message) {
                this.emit(':tell', message);
            }
            else {
                this.emit(':tell', output);
            }
        })
        .catch((reason: any) => {
            this.emit(':tell', `An Error Occurred: ${reason}`);
        });

    function estimateRemainingTime(recipe: IRecipe, stepName: string, stepStartTime: moment.Moment, latestLogEntry: ILogEntry): moment.Duration {
        console.info(`Estimating Remaining Time for ${recipe.name}. Step "${stepName}", stepStart: ${stepStartTime.format()}, last log entry:`, latestLogEntry);

        const now = latestLogEntry.dateTime;
        const minutesSpentInCurrentStep = now.diff(stepStartTime, 'minutes');
        console.log(`>>>> Minutes Spent in Current Step: ${minutesSpentInCurrentStep}`);

        var degPerMin = 2;
        var timeRemaining = 0;
        var index = recipe.steps.findIndex(step => step.name === stepName);

        const currentStep = recipe.steps[index];
        console.log('Current Step: ', currentStep);

        if (currentStep.tempTransition) { // this is a transition step from one temp to another.
            // estimate how long it'll take to heat up.
            timeRemaining += Math.round(Math.abs(latestLogEntry.wortTemp - currentStep.targetTemp) / degPerMin)
            // add the step time.
            timeRemaining += currentStep.timeInMinutes;
        }
        else {
            // it's a temp holding step (mash, etc)
            timeRemaining += currentStep.timeInMinutes - minutesSpentInCurrentStep;
        }

        // add the rest of the steps up
        for (let i = index + 1; i < recipe.steps.length; ++i) {
            let step = recipe.steps[i];
            console.log(`Step ${step.name} time = ${step.timeInMinutes}`);
            timeRemaining += step.timeInMinutes;

            if (step.tempTransition) {
                timeRemaining += Math.abs(Math.round(step.tempTransition / degPerMin));
            }
        }
        return moment.duration(timeRemaining, 'minutes');
    }

    function durationToEnglish(duration: moment.Duration): string {

        let english: string;

        // get total number of hours
        let hours = Math.floor(duration.asHours());
        switch (hours) {
            case 0:
                break;

            case 1:
                english = 'One hour';
                break;

            default:
                english = `${hours} hours`;
                break;
        }

        // get remainder minutes.
        let minutes = duration.minutes();
        switch (minutes) {
            case 0:
                break;

            case 1:
                english += ' and 1 minute';
                break;

            default:
                english += ` and ${minutes} minutes`;
        }
        return english;
    }
}
