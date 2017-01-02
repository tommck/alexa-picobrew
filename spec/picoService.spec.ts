import PicoBrew = require('../src/picobrew-service');

import { IMachineInfo } from '../src/picobrew/index';

// change this to false if you want to make real calls with the tests
var USE_FAKE_CALLS = true;

describe('picoService', () => {
    let service: PicoBrew.IPicoBrewService;

    function createService(mockRequestPromise): PicoBrew.IPicoBrewService {
        if (USE_FAKE_CALLS) {
            return new PicoBrew.PicoBrewService(mockRequestPromise);
        }
        return new PicoBrew.PicoBrewService();
    }

    describe('isCurrentlyBrewing', () => {
        describe('with no current session', () => {
            beforeEach(() => {
                let mockRequestPromise = jasmine.createSpy('requestPromise').and.returnValue(Promise.resolve('foo'));
                service = createService(mockRequestPromise);
            });

            it('should return false', () => {
                return service.isCurrentlyBrewing().then(function (isBrewing) {
                    expect(isBrewing).toEqual(false);
                });
            });
        });

        describe('with a current session', () => {
            beforeEach(() => {
                let mockRequestPromise = jasmine.createSpy('requestPromise').and.returnValue(Promise.resolve('active'));
                service = createService(mockRequestPromise);
            });

            it('should return true', () => {
                return service.isCurrentlyBrewing().then(function (isBrewing) {
                    expect(isBrewing).toEqual(true);
                });
            });
        });
    });

    describe('getActiveSessionId', () => {
        describe('with active session', () => {
            beforeEach(() => {
                let mockRequestPromise = jasmine.createSpy('requestPromise').and.returnValue(Promise.resolve({ GUID: 'hello' }));
                service = createService(mockRequestPromise);
            });

            it('should return the GUID', () => {
                return service.getActiveSessionId().then((id: string) => {
                    expect(id).toEqual('hello');
                });

            });
        });

        describe('with no active session', () => {
            beforeEach(() => {
                let mockRequestPromise = jasmine.createSpy('requestPromise').and.returnValue(Promise.resolve('""'));
                service = createService(mockRequestPromise);
            });

            it('should return the GUID', () => {
                return service.getActiveSessionId().then((id: string) => {
                    expect(id).toBeUndefined(undefined);
                });
            });
        });
    });

    describe('getMachines', () => {
        beforeEach(() => {
            var machines = [{
                ID: 2254,
                Type: 'Zymatic',
                Firmware: '1.1.12',
                Alias: 'tommck',
                State: 'Cleaning',
                UpdateAvailable: false,
                BrewsSinceLastClean: 11,
                LastBrewStart: '2016-12-28T23:37:51.583Z',
                ActiveSession: {
                    ID: 132826,
                    ProfileID: 7637,
                    MachineType: "Zymatic",
                    BrewType: "Cleaning",
                    WortTemp: 0,
                    BlockTemp: 0,
                    TargetABV: 0.1,
                    ABVTweak: null,
                    TargetIBU: 0.0,
                    IBUTweak: null,
                    SRM: 0.0,
                    OG: null,
                    FG: null,
                    StepName: "Clean Mash",
                    BeerName: "Cleaning v1",
                    BrewerName: "PicoPrograms",
                    BeerStyle: "Lite American Lager",
                    GUID: "da859f48ccde42b1a67f769f987b5926",
                    BeerGUID: null,
                    RecipeGUID: null,
                    StartTime: "2016-12-31T19:21:05.607Z",
                    LastLogDate: null,
                    SecondsRemaining: null,
                    Review: null,
                    Active: false,
                    RecipeID: null,
                    ImageLocation: "https://picobrewcontent.blob.core.windows.net/images/Brewhouse/gfc_cleaning.png"
                },
                SerialNumber: null,
                ManufactureDate: '0001-01-01T00:00:00Z',
                PicoErrorsDict: null,
                MaxBrewsBeforeClean: 3
            }];

            // resolved response actually comes from
            let response:any = Promise.resolve(machines);
            // form is just a pass-through
            response.form = jasmine.createSpy('requestPromise').and.returnValue(response);

            let mockRequestPromise:any = jasmine.createSpy('requestPromise').and.returnValue(response);
            mockRequestPromise.jar = jasmine.createSpy('jar');

            service = createService(mockRequestPromise);
        });

        it('should return an array of machines', () => {
            return service.getMachines().then((machines: IMachineInfo[]) => {
                expect(machines.length).toEqual(1);
            });
        });

        it('should have ActiveSession on the machines', () => {
            return service.getMachines().then((machines: IMachineInfo[]) => {
                expect(machines[0].activeSession).toBeDefined();
            });
        })
    });
});
