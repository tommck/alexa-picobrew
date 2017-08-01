var context = require('aws-lambda-mock-context');

import PicoBrew = require('../../src/picobrew-service');

var index = require('../../index');

import { config } from '../../src/config';
import { createTestEvent } from '../create-test-event';

// TODO: Make these tests work
xdescribe('TimeLeftIntent', () => {
    let ctx;

    beforeEach(() => {
        ctx = context();
    });

    function fakeTheServiceFactory(machines) {
        spyOn(PicoBrew.PicoBrewServiceFactory, 'createService').and.returnValue({
            getMachines: jasmine.createSpy('getMachines').and.returnValue(Promise.resolve(machines)),
            getMachineState: jasmine.createSpy('getMachineState').and.returnValue(Promise.resolve(machines[0])),
            login: jasmine.createSpy('login').and.returnValue(Promise.resolve({}))
        });
    }

    describe('with no active session', () => {
        beforeEach(() => {

            const machines = [
                {}
            ];
            //fakeTheServiceFactory(machines);

            var testEvent = createTestEvent({
                slots: {},
                name: "TimeLeftIntent"
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
                    ssml: '<speak> You are not currently brewing </speak>'
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

            fakeTheServiceFactory(machines);

            var testEvent = createTestEvent({
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

});
