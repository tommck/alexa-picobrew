import * as Alexa from 'alexa-sdk';

import * as intents from './src/intents/index';

import { config } from './src/config';

export class handler {
    constructor(event: Alexa.RequestBody, context: Alexa.Context, callback: Function) {
        let alexa = Alexa.handler(event, context);
        alexa.appId = config.appId;

        alexa.registerHandlers({
            AboutIntent: intents.AboutIntent,
            StatusIntent: intents.StatusIntent,
            LastBrewIntent: intents.LastBrewIntent,
            BrewsSinceCleaningIntent: intents.BrewsSinceCleaningIntent,
            RinseAfterLastBrewIntent: intents.RinseAfterLastBrewIntent
        });
        alexa.execute();
    }
}