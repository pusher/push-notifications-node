const request = require('request-promise-native');

describe('Publishes', () => {
    const SDK_VERSION = '1.1.1';
    const instanceId = '25c7b7c2-cabc-4e6b-b7d0-c9ad5c787e50';
    const secretKey =
        'A2DB402A49D7F7F45044D2049F5B2CDEB793564296B396A9B15A727ABE93EB50';
    let baseUrl = `https://${instanceId}.pushnotifications.pusher.com/publish_api/v1/instances/${instanceId}/publishes`;

    describe('Interests', () => {
        let baseRequest;

        beforeEach(() => {
            baseRequest = request.defaults({
                headers: {
                    Authorization: `Bearer ${secretKey}`,
                    'X-Pusher-Library': `pusher-push-notifications-node ${SDK_VERSION}`,
                    'Content-Type': 'application/json'
                },
                json: true,
                simple: true,
                resolveWithFullResponse: true
            });
        });
        test('we get what we expect', () => {
            const body = {
                apns: {
                    aps: {
                        alert: 'Hello there'
                    }
                },
                interests: ['donuts']
            };
            const options = {
                body,
                uri: baseUrl + '/interests',
                method: 'POST',
                headers: {
                    'Content-Length': Buffer.byteLength(JSON.stringify(body))
                }
            };

            return baseRequest(options).then(res => {
                expect(res.body).toHaveProperty(
                    'publishId',
                    expect.any(String)
                );
            });
        });
    });

    describe('Users', () => {
        let baseRequest;

        beforeEach(() => {
            baseRequest = request.defaults({
                headers: {
                    Authorization: `Bearer ${secretKey}`,
                    'X-Pusher-Library': `pusher-push-notifications-node ${SDK_VERSION}`,
                    'Content-Type': 'application/json'
                },
                json: true,
                simple: true,
                resolveWithFullResponse: true
            });
        });
        test('we get what we expect', () => {
            const body = {
                apns: {
                    aps: {
                        alert: 'Hello there'
                    }
                },
                users: ['user0001']
            };
            const options = {
                body,
                uri: baseUrl + '/users',
                method: 'POST',
                headers: {
                    'Content-Length': Buffer.byteLength(JSON.stringify(body))
                }
            };

            return baseRequest(options).then(res => {
                expect(res.body).toHaveProperty(
                    'publishId',
                    expect.any(String)
                );
            });
        });
    });
});
