import { config } from '../config';

export const log = {
    debug: function (...args: any[]): void {
        if (config.debug) {
            console.log.apply(console, arguments);
        }
    },
    info: function (...args: any[]): void {
        if (config.debug) {
            console.info.apply(console, arguments);
        }
    },
    error: function (...args: any[]): void {
        console.error.apply(console, arguments);
    },
    warn: function (...args: any[]): void {
        console.warn.apply(console, arguments);
    },
};

