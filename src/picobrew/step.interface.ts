/**
 * Used for both static steps or active steps.
 * If the step is active, currentTemp and remaining will be populated
 */
export interface IStep {
    index: number;
    name: string;
    currentTemp?: number;
    targetTemp?: number;
    timeInMinutes?: number;
    location: number;
    tempTransition: number;
}
