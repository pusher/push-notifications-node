const expect = require('chai').expect;

const PushNotifications = require('./index.js');

describe('PushNotifications Node SDK', () => {
    describe('Constructor', () => {
        it('should accept valid parameters', () => {
            new PushNotifications({
                instanceId: '12345',
                secretKey: '12345'
            });
        });

        it('should fail if no options passed', () => {
            expect(() => PushNotifications()).to.throw();
        });

        it('should fail if no instanceId passed', () => {
            expect(() => PushNotifications({ secretKey: '1234' })).to.throw();
        });

        it('should fail if no secretKey passed', () => {
            expect(() => PushNotifications({ instanceId: '1234' })).to.throw();
        });

        it('should fail if instanceId is not a string', () => {
            expect(() =>
                PushNotifications({ instanceId: false, secretKey: '1234' })
            ).to.throw();
        });

        it('should fail if secretKey is not a string', () => {
            expect(() =>
                PushNotifications({ instanceId: '1234', secretKey: false })
            ).to.throw();
        });

        it('should fail if endpoint is not a string', () => {
            expect(() =>
                PushNotifications({
                    instanceId: '1234',
                    secretKey: '1234',
                    endpoint: false
                })
            ).to.throw();
        });

        it('should set endpoint to the correct default', () => {
            const pn = new PushNotifications({
                instanceId: 'INSTANCE_ID',
                secretKey: 'SECRET_KEY'
            });
            expect(pn.endpoint).to.equal(
                'INSTANCE_ID.pushnotifications.pusher.com'
            );
        });
    });
});
