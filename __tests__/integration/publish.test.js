const PushNotifications = require('../../push-notifications');

describe('Publishes', () => {
    const instanceId = '25c7b7c2-cabc-4e6b-b7d0-c9ad5c787e50';
    const secretKey =
        'A2DB402A49D7F7F45044D2049F5B2CDEB793564296B396A9B15A727ABE93EB50';
    let beamsInstance;

    describe('Interests', () => {
        beforeEach(() => {
            beamsInstance = new PushNotifications({ instanceId, secretKey });
        });
        test('Publish request succeeds', () => {
            const body = {
                apns: {
                    aps: {
                        alert: 'Hello there'
                    }
                }
            };

            return expect(
                beamsInstance.publishToInterests(['donuts'], body)
            ).resolves.toHaveProperty('publishId', expect.any(String));
        });
    });

    describe('Users', () => {
        beforeEach(() => {
            beamsInstance = new PushNotifications({ instanceId, secretKey });
        });

        test('Publish request succeeds', () => {
            const body = {
                apns: {
                    aps: {
                        alert: 'Hello there'
                    }
                }
            };

            return expect(
                beamsInstance.publishToUsers(['user0001'], body)
            ).resolves.toHaveProperty('publishId', expect.any(String));
        });
    });
});
