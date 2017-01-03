/**
 * TODO: Peel this off into its own github repo/npm package
 */
import requestPromise = require('request-promise');
import { config } from './config';
import { log } from './common/log';

import * as API from './picobrew/index';

export interface IPicoBrewService {
    getSessionInfo(sessionId: API.GUID): Promise<API.ISessionSummary>;
    getMachines(): Promise<API.IMachineInfo[]>;
    getMachineState(id: number): Promise<API.IMachineInfo>;
    getSessionHistory(): Promise<API.ISession[]>;

    login(user: string, pass: string): requestPromise.RequestPromise;

    // TODO: add more functions
}

export class PicoBrewService implements IPicoBrewService {
    private basePath = 'https://picobrew.com/Json/brewhouseJson.cshtml?user=' + config.picobrew.userId;

    // strange constructor trick to allow mocking in tests
    constructor(private rp: typeof requestPromise = require('request-promise')) {
        log.info('CONSTRUCTED');
    }

    getSessionHistory() : Promise<API.ISession[]> {
        return this
            .send('POST', 'https://picobrew.com/JSONAPI/Zymatic/ZymaticSession.cshtml')
            .form({
                option: 'getAllSessionsForUser'
            })
            .then((sessions: any[]) => {
                let result: API.ISession[] = [];
                sessions.forEach((sess: any) => {
                    result.push(API.serverHelpers.ResponseToISession(sess));
                });
                return result;
            });
    }

    getSessionInfo(sessionId: API.GUID): Promise<API.ISessionSummary> {
        return this.get(`${this.basePath}&requestGUID=${sessionId}&ignoreWhetherCurrent=true&justname=3&_=${new Date().getTime()}`)
            .then((data: any): API.ISessionSummary => {
                if (data === '""') {
                    log.error('no data for sessionId', data);
                    return;
                }
                log.debug('session info: ', data);
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

    login(user: string, pass: string): requestPromise.RequestPromise {
        log.info('Logging in');

        // login url directly from picobrew code
        var url = 'https://picobrew.com/account/loginAjax.cshtml?returnURL=https://picobrew.com/members/user/brewhouse.cshtml';

        return this.send('POST', url, {
            resolveWithFullResponse: true,
            followAllRedirects: true
        }).form({
            username: user,
            password: pass
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
                return API.serverHelpers.ResponseToIMachineInfo(mach);
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
                    result.push(API.serverHelpers.ResponseToIMachineInfo(mach));
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
