/**
 * TODO: Peel this off into its own github repo
 */

import requestPromise = require('request-promise');
import { config } from './config';

import * as API from './picobrew/index';

export interface IPicoBrewService {
    isCurrentlyBrewing(): Promise<Boolean>;
    getActiveSessionId(): Promise<string>;
    getSessionInfo(sessionId: API.GUID): Promise<API.ISessionSummary>;
    getMachines(): Promise<API.IMachineInfo[]>;
    getMachineState(id: number): API.IMachineInfo;

    // TODO: expose login and allow the intents to chain commands.

    // TODO: add more functions
}

export class PicoBrewService implements IPicoBrewService {
    private basePath = 'https://picobrew.com/Json/brewhouseJson.cshtml?user=' + config.userId;

    constructor(private rp: typeof requestPromise = require('request-promise')) {
    }

    isCurrentlyBrewing(): Promise<Boolean> {
        return this.get(`${this.basePath}&justname=5&_=${new Date().getTime()}`)
            .then(function (data) {
                return data.replace(/"/g, '') === 'active';
            });
    }

    getActiveSessionId(): Promise<string> {
        return this.get(`${this.basePath}&justname=3&_=${new Date().getTime()}`)
            .then(function (data) {
                return data !== '""' ? data.GUID : undefined;
            });
    }

    getSessionInfo(sessionId: API.GUID): Promise<API.ISessionSummary> {
        return this.get(`${this.basePath}&requestGUID=${sessionId}&ignoreWhetherCurrent=true&justname=3&_=${new Date().getTime()}`)
            .then((data: any): API.ISessionSummary => {
                if (data === '""') {
                    console.error('no data for sessionId', data);
                    return;
                }
                this.debug('session info: ', data);
                var result: API.ISessionSummary = {
                    sessionId: sessionId,
                    name: data.Name,
                    description: data.TastingNotes,
                    ibu: data.IBU,
                    og: data.OG,
                    srm: data.SRM,
                    style: data.StyleNameCode
                };

                return result;
            });
    }

    login(cookieJar) {
        // login url directly from picobrew code
        var url = 'https://picobrew.com/account/loginAjax.cshtml?returnURL=https://picobrew.com/members/user/brewhouse.cshtml';

        return this.send('POST', url, {
            resolveWithFullResponse: true,
            jar: cookieJar,
            followAllRedirects: true
        }).form({
            username: config.auth.user,
            password: config.auth.pass
        });
    }

    getMachineState(id: number): API.IMachineInfo {
        var cookieJar = this.rp.jar();
        return this
            .login(cookieJar)
            .then((resp) => {
                return this
                    .send('POST', 'https://picobrew.com/JSONAPI/Zymatic/Zymatic.cshtml', {
                        jar: cookieJar,
                        followAllRedirects: true
                    })
                    .form({
                        id: id,
                        option: 'getZymatic',
                        getActiveSession: true
                    });
            })
            .then((mach: any) => {
                return API.serverHelpers.ResponseToIMachineInfo(mach);
            });
    }

    getMachines(): Promise<API.IMachineInfo[]> {
        var cookieJar = this.rp.jar();

        return this.login(cookieJar)
            .then((resp) => {

                return this.send('POST', 'https://picobrew.com/JSONAPI/Zymatic/Zymatic.cshtml', {
                    jar: cookieJar,
                    followAllRedirects: true
                }).form({
                    option: 'getZymaticsForUser',
                    getActiveSession: false
                }).then((data: any[]) => {
                    let result: API.IMachineInfo[] = [];
                    data.forEach((mach: any) => {
                        result.push(API.serverHelpers.ResponseToIMachineInfo(mach));
                    });
                    return result;
                })
            });
    }

    private get(path: string): Promise<any> {
        return this.send('GET', path);
    }

    private post(path: string, formData?: any): Promise<any> {
        var req = this.send('POST', path);
        if (formData) {
            this.debug('Form Data:', formData);
            req.form(formData);
        }
        return req;
    }

    private send(
        method: 'GET' | 'POST',
        path: string,
        opts: any = null) {
        var url = path;

        if (config.testServer) {
            url = 'http://localhost:4567' + path;
        }

        this.debug(`${method}ting: ${url}`);

        const options = {
            ...opts,
            method: method,
            url: url,
            json: true,
            headers: { 'X-Requested-With': 'XMLHttpRequest' }
        }
        return this.rp(options);
    }

    private debug(...args: any[]) {
        if (config.debug) {
            console.log.apply(console, arguments);
        }
    }
}

export interface IPicoBrewServiceFactory {
    createService() : IPicoBrewService;
}

export const PicoBrewServiceFactory: IPicoBrewServiceFactory = {
    createService() : IPicoBrewService {
        return new PicoBrewService();
    }
};
