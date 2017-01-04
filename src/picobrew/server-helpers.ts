
import { ILogEntry } from './log-entry.interface';
import { IRecipe } from './recipe.interface';
import { IRecipeSummary } from './recipe-summary.interface';
import { IStep } from './step.interface';
import { IActiveSession } from './active-session.interface';

import * as common from './common';

import * as moment from 'moment';

// TODO: Enum?
function brewType(serverData: any): common.RecipeType {
    let result: common.RecipeType;

    switch (serverData.BrewType) {
        case 'SousVide':
            result = 'SousVide';
            break;

        case 'Cleaning':
            if (serverData.BeerName.startsWith('Cleaning')) {
                result = 'Cleaning';
            }
            else {
                result = 'Rinse';
            }
            break;

        default:
            result = 'Brewing';
            break;
    }

    return result;
}

function convertResponseToISession(data) {
    return data && {
        id: data.ID,  // session id.
        profileId: data.ProfileID, // user profile
        machineType: data.MachineType,
        brewType: brewType(data),
        wortTemp: data.WortTemp,
        blockTemp: data.BlockTemp,
        targedAbv: data.TargetABV,
        abvTweak: data.ABVTweak,
        targetIbu: data.TargetIBU,
        ibuTweak: data.IBUTweak,
        srm: data.SRM,
        og: data.OG,
        fg: data.FG,
        stepName: data.StepName,
        beerName: data.BeerName,
        brewerName: data.BrewerName,
        beerStyle: data.BeerStyle,
        guid: data.GUID,
        beerGuid: data.BeerGUID,
        recipeGuid: data.RecipeGUID,
        startTime: data.StartTime,
        lastLogDate: data.LastLogDate,
        secondsRemaining: data.SecondsRemaining,
        review: data.Review,
        isActive: data.Active,
        recipeID: data.RecipeID
    };
}

function convertResponseToIMachineInfo(mach) {
    return mach && {
        id: mach.ID,
        type: mach.Type,
        firmware: mach.Firmware,
        alias: mach.Alias,
        state: mach.State,
        updateAvailable: mach.UpdateAvailable,
        brewsSinceLastClean: mach.BrewsSinceLastClean,
        lastBrewStart: mach.LastBrewStart,
        activeSession: convertResponseToISession(mach.ActiveSession),
        serialNumber: mach.SerialNumber,
        manufactureDate: mach.ManufactureDate,
        picoErrorsDict: mach.PicoErrorsDict,
        maxBrewsBeforeClean: mach.MaxBrewsBeforeClean
    };
}

function getUserIdFromLoginResponse(response) {
    // search for a string like this: var user = 'asdfasdfasdfasdfasdfasdf';
    var regex = /^\s+var user = \'(.*?)\';/m;
    var match = regex.exec(response);
    if (match) {
        return match[1];
    }
}

function convertResponseToLogEntries(response: string): ILogEntry[] {
    let entries = response.split('|');
    let result: ILogEntry[] = [];
    entries.forEach((entry) => {
        let columns = entry.split(',');
        result.push({
            dateTime: moment(parseInt(columns[0])),
            newStepName: columns[1].replace('null', ''),
            wortTemp: parseInt(columns[2]),
            note: columns[7]
        });
    });
    return result;
}

function convertReponseToRecipeSummaries(response: any[]): IRecipeSummary[] {
    response = response || [];
    let result: IRecipeSummary[] = [];
    response.forEach((rec) => {
        result.push({
            id: rec.ID,
            machineType: rec.MachineType,
            recipeType: rec.RecipeType,
            name: rec.Name,
            style: rec.Style,
            abv: rec.ABC,
            ibu: rec.IBU,
            srm: rec.SRM,
            lastBrewed: moment(rec.LastBrewed),
            guid: rec.GUID,
            isSynced: rec.synced
        });
    });
    return result;
}

function convertReponseToRecipes(data: string): IRecipe[] {
    data = data.slice(3, data.length - 3);
    var recipes: IRecipe[] = [];
    if (data.length !== 0) {
        var recipeStrings = data.split('|');
        recipeStrings.forEach(function (recipeString) {
            recipes.push(parseRecipe(recipeString));
        });
    }
    return recipes;

    /**
     * copied this wholesale from https://github.com/toddq/whatspicobrewing code
     */
    function parseRecipe(stringToParse): IRecipe {
        var Location = {
            START: 0,
            PAUSE: 6
        };

        var recipeString = stringToParse.split('/');
        var recipe = {
            name: recipeString[0].trim(),
            id: recipeString[1],
            steps: []
        };
        for (var i = 2; i < recipeString.length; i++) {
            if (recipeString[i]) {
                var steps = recipeString[i].split(',');
                var step: IStep = {
                    index: i - 2,
                    name: steps[0],
                    targetTemp: parseInt(steps[1]),
                    timeInMinutes: parseInt(steps[2]) + parseInt(steps[4]),
                    location: parseInt(steps[3]),
                    tempTransition: 0
                };

                if (step.index === Location.START) {
                    // step 0 is a special case
                    step.tempTransition = step.targetTemp - 60;
                } else if (step.location !== Location.PAUSE) {
                    // 6 indicates pause
                    step.tempTransition = step.targetTemp - recipe.steps[step.index - 1].targetTemp;
                } else if (step.location === Location.PAUSE && step.targetTemp === 0) {
                    step.targetTemp = recipe.steps[step.index - 1].targetTemp;
                }

                recipe.steps.push(step);
            }
        }

        return recipe;

    }
}

function convertReponseToActiveSession(response: any): IActiveSession {
    return response && {
        machineId: response.UID,
        guid: response.GUID,
        firmwareVersion: response.Firmware,
        srm: response.SRM,
        og: response.OG,
        ibu: response.IBU,
        tastingNotes: response.TastingNotes,
        author: response.Author,
        name: response.Name,
        style: response.StyleNameCode
    };
}

export const serverHelpers = {
    getUserIdFromLoginResponse: getUserIdFromLoginResponse,

    convertReponseToActiveSession: convertReponseToActiveSession,
    convertResponseToISession: convertResponseToISession,
    convertResponseToIMachineInfo: convertResponseToIMachineInfo,
    convertResponseToLogEntries: convertResponseToLogEntries,
    convertReponseToRecipeSummaries: convertReponseToRecipes,
    convertReponseToRecipes: convertReponseToRecipes
};