/**
 * TODO: Peel this off into its own github repo/npm package
 */
import requestPromise = require('request-promise');
import { config } from './config';
import { log } from './common/log';

import * as API from './picobrew/index';

export interface IPicoBrewService {
    login(user: string, pass: string): requestPromise.RequestPromise;

    getMachines(): Promise<API.IMachineInfo[]>;
    getMachineState(id: number): Promise<API.IMachineInfo>;
    getSessionHistory(): Promise<API.ISession[]>;

    getCurrentLogEntries(userId: string): Promise<API.ILogEntry[]>;
    getAllRecipeSummaries(): Promise<API.IRecipeSummary[]>;

    getRecipesForMachine(userId: string, machineSerialNumber: string): Promise<API.IRecipe[]>;

    getActiveSession(userId: string): Promise<API.IActiveSession>;

    // TODO: add more functions
}

export class PicoBrewService implements IPicoBrewService {

    // strange constructor trick to allow mocking in tests
    constructor(private rp: typeof requestPromise = require('request-promise')) {
    }

    getActiveSession(userId: string): Promise<API.IActiveSession> {
        log.info(`Getting active session for ${userId}`);
        return this
            .send('GET', `https://picobrew.com/Json/brewhouseJson.cshtml?user=${userId}&justname=3`)
            .then((response: any) => {
                return API.serverHelpers.convertReponseToActiveSession(response);
            })
    }

    getCurrentLogEntries(userId: string): Promise<API.ILogEntry[]> {
        log.info(`Getting Log Entries for ${userId}`);
        return this
            .send('GET', `https://picobrew.com/Json/brewhouseJson.cshtml?user=${userId}`)
            .then((response: string) => {
                return API.serverHelpers.convertResponseToLogEntries(response);
            });
    }

    getRecipesForMachine(userId: string, machineSerialNumber: string): Promise<API.IRecipe[]> {
        log.info(`Getting Recipes for ${userId}/${machineSerialNumber}`);
        return this
            .send('GET', `https://picobrew.com/API/SyncUser?user=${userId}&machine=${machineSerialNumber}`)
            .form({
                option: 'getAllRecipesForUser'
            })
            .then((response: string) => {
                return API.serverHelpers.convertReponseToRecipes(response);
            });
    }

    getAllRecipeSummaries(): Promise<API.IRecipeSummary[]> {
        return this
            .send('POST', `https://picobrew.com/JSONAPI/Zymatic/ZymaticRecipe.cshtml`)
            .form({
                option: 'getAllRecipesForUser'
            })
            .then((response: string) => {
                return API.serverHelpers.convertReponseToRecipeSummaries(response);
            });
    }


    getSessionHistory(): Promise<API.ISession[]> {
        return this
            .send('POST', 'https://picobrew.com/JSONAPI/Zymatic/ZymaticSession.cshtml')
            .form({
                option: 'getAllSessionsForUser'
            })
            .then((sessions: any[]) => {
                let result: API.ISession[] = [];
                sessions.forEach((sess: any) => {
                    result.push(API.serverHelpers.convertResponseToISession(sess));
                });
                return result;
            });
    }

    /**
     * returns the GUID user ID
     */
    login(user: string, pass: string): requestPromise.RequestPromise {
        log.info('Logging in');

        // login url directly from picobrew code
        var url = 'https://picobrew.com/account/loginAjax.cshtml?returnURL=https://picobrew.com/members/user/brewhouse.cshtml';

        return this.send('POST', url, {
            followAllRedirects: true // if I don't do this, I need to do custom processing to look for a 302
        }).form({
            username: user,
            password: pass
        }).then((result) => {
            return API.serverHelpers.getUserIdFromLoginResponse(result);
        });
    }

    getMachineState(id: number): Promise<API.IMachineInfo> {
        log.info(`Getting Machine state for ID:${id}`);

        return this
            .send('POST', 'https://picobrew.com/JSONAPI/Zymatic/Zymatic.cshtml', {
                followAllRedirects: true
            })
            .form({
                id: id,
                option: 'getZymatic',
                getActiveSession: true
            })
            .then((mach: any) => {
                log.debug('Results of POST:', mach);
                return API.serverHelpers.convertResponseToIMachineInfo(mach);
            });
    }

    getMachines(): Promise<API.IMachineInfo[]> {
        log.info('Getting Machines');

        return this
            .send('POST', 'https://picobrew.com/JSONAPI/Zymatic/Zymatic.cshtml', {
                followAllRedirects: true
            })
            .form({
                option: 'getZymaticsForUser',
                getActiveSession: false
            })
            .then((data: any[]) => {
                let result: API.IMachineInfo[] = [];
                data.forEach((mach: any) => {
                    result.push(API.serverHelpers.convertResponseToIMachineInfo(mach));
                });
                log.debug('Returning Machines', result);
                return result;
            })
    }

    private get(path: string): requestPromise.RequestPromise {
        return this.send('GET', path);
    }

    private post(path: string, formData?: any): requestPromise.RequestPromise {
        var req = this.send('POST', path);
        if (formData) {
            log.debug('Form Data:', formData);
            req.form(formData);
        }
        return req;
    }

    private send(
        method: 'GET' | 'POST',
        path: string,
        opts: any = null): requestPromise.RequestPromise {
        var url = path;

        if (config.testServer) {
            url = 'http://localhost:4567' + path;
        }

        log.debug(`${method}ting: ${url}`);

        const options = {
            ...opts,
            method: method,
            jar: true,
            url: url,
            json: true,
            headers: { 'X-Requested-With': 'XMLHttpRequest' }
        }
        return this.rp(options);
    }
}

export interface IPicoBrewServiceFactory {
    createService(): IPicoBrewService;
}

export const PicoBrewServiceFactory: IPicoBrewServiceFactory = {
    createService(): IPicoBrewService {
        return new PicoBrewService();
    }
};
