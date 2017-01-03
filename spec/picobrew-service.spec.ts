import PicoBrew = require('../src/picobrew-service');

import { IMachineInfo } from '../src/picobrew/index';
import { config } from '../src/config';

// change this to false if you want to make real calls with the tests
var USE_FAKE_CALLS = true;

describe('picobrew-service', () => {
    let service: PicoBrew.IPicoBrewService;

    function createService(mockRequestPromise): PicoBrew.IPicoBrewService {
        if (USE_FAKE_CALLS) {
            return new PicoBrew.PicoBrewService(mockRequestPromise);
        }
        return new PicoBrew.PicoBrewService();
    }

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

            let mockRequestPromise: any = jasmine.createSpy('requestPromise').and.returnValue(response);

            service = createService(mockRequestPromise);
        });

        it('should return an array of machines', (done) => {
            return service
                .login(config.picobrew.auth.user, config.picobrew.auth.pass)
                .then(() => service.getMachines())
                .then((machines: IMachineInfo[]) => {
                    expect(machines.length).toEqual(1);
                    done();
                });
        });

        it('should have ActiveSession on the machines', (done) => {
            return service
                .login(config.picobrew.auth.user, config.picobrew.auth.pass)
                .then(() => service.getMachines())
                .then((machines: IMachineInfo[]) => {
                    expect(machines[0].activeSession).toBeTruthy();
                    done();
                });
        })
    });
});
