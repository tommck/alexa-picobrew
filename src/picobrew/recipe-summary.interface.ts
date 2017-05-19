import { Moment } from 'moment';
import * as common from './common';

export interface IRecipeSummary {
    id: number;
    machineType: common.MachineType;
    recipeType: common.RecipeType;
    name: string;
    style: string;
    abv: number;
    ibu: number;
    srm: number;
    lastBrewed: Moment;
    // ImageLocation
    guid: common.GUID;
    isSynced: boolean;
}
