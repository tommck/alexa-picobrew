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
                const machines = [
                    {
                        id: 12,
                        lastBrewStart: test.format()
                    }
                ];
                fakeTheServiceFactory(machines);

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

            const machines = [{
                id: 1234,
                lastBrewStart: moment().subtract(1, 'day').format(),
                activeSession: {
                    brewType: 'Cleaning',
                    stepName: 'Heat Water'
                }
            }];

            fakeTheServiceFactory(machines);

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
                    ssml: '<speak> Didn\'t you know? Your machine is currently Cleaning. The current step is Heat Water. </speak>'
                });
                done();
            });
        });
    });

    describe('with no machines', () => {
        beforeEach(function () {

            const machines = [];

            fakeTheServiceFactory(machines);

            var testEvent = createTestEvent({
                slots: {},
                name: "LastBrewIntent"
            });

            new index.handler(testEvent, ctx);
        });

        it('should have a response', (done) => {
            ctx.Promise.then(response => {
                expect(response).not.toBeNull();
                done();
            });
        });

        it('should say that no machines were found', (done) => {
            ctx.Promise.then(data => {
                expect(data.response.outputSpeech).toEqual({
                    type: 'SSML',
                    ssml: '<speak> No Machines were found </speak>'
                });
                done();
            });

        })
    })

    describe('with more than one machine', () => {
        // TODO: real support
        beforeEach(function () {

            const machines = [
                {},
                {}
            ];

            fakeTheServiceFactory(machines);

            var testEvent = createTestEvent({
                slots: {},
                name: "LastBrewIntent"
            });

            new index.handler(testEvent, ctx);
        });

        it('should have a response', (done) => {
            ctx.Promise.then(response => {
                expect(response).not.toBeNull();
                done();
            });
        });

        it('should say that more than one machine is not supported', (done) => {
            ctx.Promise.then(data => {
                expect(data.response.outputSpeech).toEqual({
                    type: 'SSML',
                    ssml: '<speak> more than one machine is not supported </speak>'
                });
                done();
            });
        });
    });

    function fakeTheServiceFactory(machines) {
        spyOn(PicoBrew.PicoBrewServiceFactory, 'createService').and.returnValue({
            getMachines: jasmine.createSpy('getMachines').and.returnValue(Promise.resolve(machines)),
            getMachineState: jasmine.createSpy('getMachineState').and.returnValue(Promise.resolve(machines[0])),
            login: jasmine.createSpy('login').and.returnValue(Promise.resolve({}))
        });
    }
});
