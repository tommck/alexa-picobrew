import { GUID } from './common';

/**
 * a brew session
 */
export interface ISession {
    id: number; // "ID": 132826,
    profileId: number; // "ProfileID": 7637,
    machineType: 'Zymatic' | 'Pico'; //"MachineType": "Zymatic"
    brewType: string; // "BrewType": "Cleaning",
    wortTemp: number; // "WortTemp": 0,
    blockTemp: number; // "BlockTemp": 0,
    targedAbv: number; // "TargetABV": 0.1,
    abvTweak: number; // "ABVTweak": null,
    targetIbu: number; // "TargetIBU": 0.0,
    ibuTweak: number; // "IBUTweak": null,
    srm: number; // "SRM": 0.0,
    og: number; // "OG": null,
    fg: number; // "FG": null,
    stepName: string; // "StepName": "Heat Water",
    beerName: string; // "BeerName": "Cleaning v1",
    brewerName: string; // "BrewerName": "PicoPrograms",
    beerStyle: string; // "BeerStyle": "Lite American Lager",
    guid: GUID; // "GUID": "da859f48ccde42b1a67f769f987b5926",
    beerGuid: GUID; // "BeerGUID": null,
    recipeGuid: GUID; //"RecipeGUID": null,
    startTime: string; // "StartTime": "2016-12-31T19:21:05.607Z",
    lastLogDate: string; // "LastLogDate": null,
    secondsRemaining: string; // "SecondsRemaining": null,
    review: any; // "Review": null,
    isActive: boolean; // "Active": false,
    recipeID: any; // "RecipeID": null,
    // "ImageLocation": "https://picobrewcontent.blob.core.windows.net/images/Brewhouse/gfc_cleaning.png"
}
