import { config } from '../src/config';

export function createTestEvent(intent) {
    return {
        request: {
            intent,
            locale: 'en-US',
            requestId: 'request5678',
            type: 'IntentRequest'
        },
        session: {
            application: {
                applicationId: config.appId
            },
            attributes: {},
            new: true,
            sessionId: 'session1234',
            user: {
                userId: null
            }
        },
        version: '1.0'
    };
}
