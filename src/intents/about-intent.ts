import { Handler } from 'alexa-sdk';

export function AboutIntent(this: Handler) {
    this.emit(':tell', 'This skill was written by Tom McKearney');
}
