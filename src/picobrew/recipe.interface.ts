import * as common from './common';
import { Moment } from 'moment';
import { IStep } from './step.interface';

export interface IRecipe {
    id: number;
    name: string;
    steps: IStep[]
}