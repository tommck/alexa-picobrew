import { config } from '../src/config';

export function createTestEvent(intent) {
    return {
        "session": {
            "new": true,
            "sessionId": "session1234",
            "attributes": {},
            "user": {
                "userId": null
            },
            "application": {
                "applicationId": config.appId
            }
        },
        "version": "1.0",
        "request": {
            "locale": "en-US",
            "type": "IntentRequest",
            "intent": intent,
            "requestId": "request5678"
        }
    }
}

