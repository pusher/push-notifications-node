require('jest');
const PushNotifications = require('../push-notifications.js');

describe('PushNotifications Constructor', () => {
    it('should accept valid parameters', () => {
        new PushNotifications({
            instanceId: '12345',
            secretKey: '12345'
        });
    });

    it('should fail if no options passed', () => {
        expect(() => PushNotifications()).toThrow(
            'PushNotifications options object is required'
        );
        expect(() => PushNotifications(null)).toThrow(
            'PushNotifications options object is required'
        );
    });

    it('should fail if no instanceId passed', () => {
        expect(() => PushNotifications({ secretKey: '1234' })).toThrow(
            '"instanceId" is required in PushNotifications options'
        );
    });

    it('should fail if no secretKey passed', () => {
        expect(() => PushNotifications({ instanceId: '1234' })).toThrow(
            '"secretKey" is required in PushNotifications options'
        );
    });

    it('should fail if instanceId is not a string', () => {
        expect(() =>
            PushNotifications({ instanceId: false, secretKey: '1234' })
        ).toThrow();
    });

    it('should fail if secretKey is not a string', () => {
        expect(() =>
            PushNotifications({ instanceId: '1234', secretKey: false })
        ).toThrow();
    });

    it('should fail if endpoint is not a string', () => {
        expect(() =>
            PushNotifications({
                instanceId: '1234',
                secretKey: '1234',
                endpoint: false
            })
        ).toThrow();
    });

    it('should set endpoint to the correct default', () => {
        const pn = new PushNotifications({
            instanceId: 'INSTANCE_ID',
            secretKey: 'SECRET_KEY'
        });
        expect(pn.endpoint).toEqual(
            'INSTANCE_ID.pushnotifications.pusher.com'
        );
    });
});
