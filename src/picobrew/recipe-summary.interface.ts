import * as common from './common';
import { Moment } from 'moment';

export interface IRecipeSummary {
    id: number;
    machineType: common.MachineType;
    recipeType: common.RecipeType;
    name: string;
    style: string;
    abv: number;
    ibu: number;
    srm: number;
    lastBrewed: Moment; // datetime
    // ImageLocation
    guid: common.GUID;
    isSynced: boolean
}