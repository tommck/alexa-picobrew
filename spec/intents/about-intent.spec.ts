var context = require('aws-lambda-mock-context');

import PicoBrew = require('../../src/picobrew-service');

var index = require('../../index');

import { config } from '../../src/config';

import { createTestEvent } from '../create-test-event';

describe('AboutIntent', () => {
    let ctx;

    beforeEach(() => {
        ctx = context();
    });

    const aboutEvent = createTestEvent({
        slots: {},
        name: "AboutIntent"
    });

    it('should say Tom wrote it', (done) => {
        new index.handler(aboutEvent, ctx);

        return ctx.Promise.then((speechResponse) => {
            expect(speechResponse.response.outputSpeech).toEqual({
                type: 'SSML',
                ssml: '<speak> This skill was written by Tom McKearney with Pico S contributions by Justin Lindh </speak>'
            });
            done();
        });
    });
});


