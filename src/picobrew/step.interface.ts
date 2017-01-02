/**
 * Used for both static steps or active steps.
 * If the step is active, currentTemp and remaining will be populated
 */
export interface IStep {
    name: string;
    currentTemp?: number;
    targetTemp?: number;
    duration?: number;
    remaining?: number;
}
