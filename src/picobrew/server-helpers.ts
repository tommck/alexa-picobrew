
type BrewType = 'Cleaning' | 'Rinse' | 'Brewing' | 'SousVide';
// TODO: Enum?
function brewType(serverData: any): BrewType {
    let result: BrewType;

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

function ResponseToISession(data) {
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

function ResponseToIMachineInfo(mach) {
    return mach && {
        id: mach.ID,
        type: mach.Type,
        firmware: mach.Firmware,
        alias: mach.Alias,
        state: mach.State,
        updateAvailable: mach.UpdateAvailable,
        brewsSinceLastClean: mach.BrewsSinceLastClean,
        lastBrewStart: mach.LastBrewStart,
        activeSession: ResponseToISession(mach.ActiveSession),
        serialNumber: mach.SerialNumber,
        manufactureDate: mach.ManufactureDate,
        picoErrorsDict: mach.PicoErrorsDict,
        maxBrewsBeforeClean: mach.MaxBrewsBeforeClean
    };
}


export const serverHelpers = {
    ResponseToISession: ResponseToISession,
    ResponseToIMachineInfo: ResponseToIMachineInfo
};