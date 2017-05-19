import * as Alexa from 'alexa-sdk';

import * as intents from './src/intents/index';

import { config } from './src/config';

// tslint:disable-next-line:class-name
export class handler {
    constructor(event: Alexa.RequestBody, context: Alexa.Context, callback: Function) {
        const alexa = Alexa.handler(event, context);
        alexa.appId = config.appId;

        alexa.registerHandlers({
            AboutIntent: intents.AboutIntent,
            BrewsSinceCleaningIntent: intents.BrewsSinceCleaningIntent,
            LastBrewIntent: intents.LastBrewIntent,
            RinseAfterLastBrewIntent: intents.RinseAfterLastBrewIntent,
            StatusIntent: intents.StatusIntent,
            TimeLeftIntent: intents.TimeLeftIntent
        });
        alexa.execute();
    }
}