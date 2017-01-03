var context = require('aws-lambda-mock-context');
import * as moment from 'moment';

import PicoBrew = require('../../src/picobrew-service');

var index = require('../../index');

import { config } from '../../src/config';
import { createTestEvent } from '../create-test-event';

describe('LastBrewIntent', () => {
    let ctx;

    beforeEach(() => {
        ctx = context();
    });

    describe('with no active session', () => {

        [
            moment().subtract(1, 'day').set({ hour: 14, minute: 0 }),
            moment().subtract(4, 'day').set({ hour: 14, minute: 0 }),
        ].forEach((test) => {
            it('should say the correct brew time in english', (done) => {
                const sessions = [{
                    id: 1234,
                    brewType: 'Brewing',
                    stepName: 'Heat Water',
                    beerName: 'Foo',
                    isActive: false,
                    startTime: test
                }];

                fakeTheServiceFactory(sessions);

                var testEvent = createTestEvent({
                    slots: {},
                    name: "LastBrewIntent"
                });

                new index.handler(testEvent, ctx);

                ctx.Promise.then(data => {
                    expect(data.response.outputSpeech).toEqual({
                        type: 'SSML',
                        ssml: jasmine.stringMatching(/^<speak> The last time you brewed was .*? <\/speak>/)
                    });
                    done();
                });
            });
        });
    });

    describe('with active session', () => {
        beforeEach(function () {

            const sessions = [{
                id: 1234,
                brewType: 'Brewing',
                stepName: 'Heat Water',
                beerName: 'Foo',
                isActive: true,
                startTime: moment().subtract(1, 'day').format()
            }];

            fakeTheServiceFactory(sessions);

            var testEvent = createTestEvent({
                slots: {},
                name: "LastBrewIntent"
            });

            new index.handler(testEvent, ctx);
        });

        it('should speak the proper response', (done) => {
            ctx.Promise.then(data => {
                expect(data.response.outputSpeech).toEqual({
                    type: 'SSML',
                    ssml: '<speak> Didn\'t you know? Your machine is currently Brewing Foo. The current step is Heat Water. </speak>'
                });
                done();
            });
        });
    });


    function fakeTheServiceFactory(sessions) {
        spyOn(PicoBrew.PicoBrewServiceFactory, 'createService').and.returnValue({
            login: jasmine.createSpy('login').and.returnValue(Promise.resolve({})),
            getSessionHistory: jasmine.createSpy('getSessionHistory').and.returnValue(Promise.resolve(sessions))
        });
    }
});
