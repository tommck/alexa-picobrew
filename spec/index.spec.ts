var context = require('aws-lambda-mock-context');

import PicoBrew = require('../src/picobrew-service');

var index = require('../index');

import { config } from '../src/config';

describe('Intents', () => {
    let ctx;

    beforeEach(() => {
        ctx = context();
    });

    describe('AboutIntent', () => {
        const aboutEvent = createEvent({
            slots: {},
            name: "AboutIntent"
        });

        it('should say Tom wrote it', (done) => {
            new index.handler(aboutEvent, ctx);

            return ctx.Promise.then((speechResponse) => {
                expect(speechResponse.response.outputSpeech).toEqual({
                    type: 'SSML',
                    ssml: '<speak> This skill was written by Tom McKearney </speak>'
                });
                done();
            });
        });
    });

    describe('StatusIntent -', () => {
        describe('with no active session', () => {
            beforeEach(() => {

                const machines = [
                    {}
                ];

                spyOn(PicoBrew.PicoBrewServiceFactory, 'createService').and.returnValue({
                    getMachines: jasmine.createSpy('getMachines').and.returnValue(Promise.resolve(machines)),
                    getMachineState: jasmine.createSpy('getMachineState').and.returnValue(Promise.resolve(machines[0]))
                });

                var testEvent = createEvent({
                    slots: {},
                    name: "StatusIntent"
                });

                new index.handler(testEvent, ctx);
            });

            it('should have a response', (done) => {
                ctx.Promise.then(response => {
                    expect(response).not.toBeNull();
                    done();
                });
            });

            it('should say the machine is idle', (done) => {
                ctx.Promise.then(data => {
                    expect(data.response.outputSpeech).toEqual({
                        type: 'SSML',
                        ssml: '<speak> Your machine is idle </speak>'
                    });
                    done();
                });
            });
        });

        describe('with active Cleaning session', () => {
            beforeEach(function () {

                const machines = [{
                    id: 1234,
                    activeSession: {
                        brewType: 'Cleaning',
                        stepName: 'Heat Water'
                    }
                }];

                spyOn(PicoBrew.PicoBrewServiceFactory, 'createService').and.returnValue({
                    getMachines: jasmine.createSpy('getMachines').and.returnValue(Promise.resolve(machines)),
                    getMachineState: jasmine.createSpy('getMachineState').and.returnValue(Promise.resolve(machines[0]))
                });

                var testEvent = createEvent({
                    slots: {},
                    name: "StatusIntent"
                });

                new index.handler(testEvent, ctx);
            });

            it('should have a response', (done) => {
                ctx.Promise.then(response => {
                    expect(response).not.toBeNull();
                    done();
                });
            });

            it('should speak the proper response', (done) => {
                ctx.Promise.then(data => {
                    expect(data.response.outputSpeech).toEqual({
                        type: 'SSML',
                        ssml: '<speak> Your machine is currently Cleaning. The current step is Heat Water. </speak>'
                    });
                    done();
                });
            });
        });

        describe('with no machines', () => {
            beforeEach(function () {

                const machines = [];

                spyOn(PicoBrew.PicoBrewServiceFactory, 'createService').and.returnValue({
                    getMachines: jasmine.createSpy('getMachines').and.returnValue(Promise.resolve(machines)),
                    getMachineState: jasmine.createSpy('getMachineState').and.returnValue(Promise.resolve(machines[0]))
                });

                var testEvent = createEvent({
                    slots: {},
                    name: "StatusIntent"
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

                spyOn(PicoBrew.PicoBrewServiceFactory, 'createService').and.returnValue({
                    getMachines: jasmine.createSpy('getMachines').and.returnValue(Promise.resolve(machines)),
                    getMachineState: jasmine.createSpy('getMachineState').and.returnValue(Promise.resolve(machines[0]))
                });

                var testEvent = createEvent({
                    slots: {},
                    name: "StatusIntent"
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

            })
        })
    });
});

function createEvent(intent) {
    return {
        "session": {
            "new": true,
            "sessionId": "session1234",
            "attributes": {},
            "user": {
                "userId": null
            },
            "application": {
                "applicationId": config.appId
            }
        },
        "version": "1.0",
        "request": {
            "locale": "en-US",
            "type": "IntentRequest",
            "intent": intent,
            "requestId": "request5678"
        }
    }
}

