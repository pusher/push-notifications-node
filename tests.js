const expect = require('chai').expect;
const nock = require('nock');

const PushNotifications = require('./push-notifications.js');

describe('PushNotifications Node SDK', () => {
    describe('Constructor', () => {
        it('should accept valid parameters', () => {
            new PushNotifications({
                instanceId: '12345',
                secretKey: '12345'
            });
        });

        it('should fail if no options passed', () => {
            expect(() => PushNotifications()).to.throw(
                'PushNotifications options object is required'
            );
        });

        it('should fail if no instanceId passed', () => {
            expect(() => PushNotifications({ secretKey: '1234' })).to.throw(
                '"instanceId" is required in PushNotifications options'
            );
        });

        it('should fail if no secretKey passed', () => {
            expect(() => PushNotifications({ instanceId: '1234' })).to.throw(
                '"secretKey" is required in PushNotifications options'
            );
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

    describe('publish', () => {
        afterEach(function() {
            nock.cleanAll();
        });

        it('should make the correct http request with valid params', () => {
            let uri, headers, body;
            nock(new RegExp('/.*/'))
                .post(new RegExp('/.*/'))
                .reply(function(u, b) {
                    uri = u;
                    headers = this.req.headers;
                    body = b;
                    return [
                        200,
                        {
                            publishId: '123456'
                        }
                    ];
                });

            const pn = new PushNotifications({
                instanceId: 'INSTANCE_ID',
                secretKey: 'SECRET_KEY'
            });
            const response = pn.publish(['donuts'], {
                apns: {
                    aps: {
                        alert: 'Hi!'
                    }
                }
            });

            return response.then(data => {
                expect(data).to.deep.equal({
                    publishId: '123456'
                });
                expect(uri).to.equal(
                    '/publish_api/v1/instances/INSTANCE_ID/publishes'
                );
                expect(headers).to.deep.equal({
                    'content-type': 'application/json',
                    'content-length': 55,
                    authorization: 'Bearer SECRET_KEY',
                    'x-pusher-library': 'pusher-push-notifications-node 0.10.1',
                    host: 'instance_id.pushnotifications.pusher.com'
                });
                expect(body).to.deep.equal({
                    interests: ['donuts'],
                    apns: {
                        aps: {
                            alert: 'Hi!'
                        }
                    }
                });
            });
        });

        it('should fail if no interests nor publishRequest are passed', () => {
            const pn = new PushNotifications({
                instanceId: '1234',
                secretKey: '1234'
            });
            expect(() => pn.publish()).to.throw(
                'interests argument is required'
            );
        });

        it('should fail if interests parameter passed is not an array', () => {
            const pn = new PushNotifications({
                instanceId: '1234',
                secretKey: '1234'
            });
            expect(() => pn.publish('donuts')).to.throw(
                'interests argument is must be an array'
            );
        });

        it('should fail if no publishRequest is passed', () => {
            const pn = new PushNotifications({
                instanceId: '1234',
                secretKey: '1234'
            });
            expect(() => pn.publish(['donuts'])).to.throw(
                'publishRequest argument is required'
            );
        });

        it('should fail if no interests are passed', () => {
            const pn = new PushNotifications({
                instanceId: '1234',
                secretKey: '1234'
            });
            expect(() => pn.publish([], {})).to.throw(
                'Publish requests must target at least one interest to be delivered'
            );
        });

        it('should fail if an interest is not a string', () => {
            const pn = new PushNotifications({
                instanceId: '1234',
                secretKey: '1234'
            });
            expect(() => pn.publish(['good_interest', false], {})).to.throw(
                'interest false is not a string'
            );
        });

        it('should fail if an interest is too long', () => {
            const pn = new PushNotifications({
                instanceId: '1234',
                secretKey: '1234'
            });
            expect(() =>
                pn.publish(['good_interest', 'a'.repeat(165)], {})
            ).to.throw('is longer than the maximum of 164 characters');
        });

        it('should fail if an interest contains invalid characters', () => {
            const pn = new PushNotifications({
                instanceId: '1234',
                secretKey: '1234'
            });
            expect(() =>
                pn.publish(['good_interest', 'bad-interest'], {})
            ).to.throw('contains a "-" which is forbidden');
            expect(() =>
                pn.publish(['good_interest', 'bad(interest)'], {})
            ).to.throw('contains a forbidden character');
        });

        it('should reject the returned promise on network error', () => {
            nock.disableNetConnect();
            const pn = new PushNotifications({
                instanceId: '1234',
                secretKey: '1234'
            });
            pn.publish(['donuts'], {}).catch(e => {
                expect(e).to.exist;
                expect(e.message).to.contain('Not allow net connect');
            });
        });

        it('should reject the returned promise on HTTP error', () => {
            nock(new RegExp('/.*/'))
                .post(new RegExp('/.*/'))
                .reply(400, {
                    error: 'Fake error',
                    description: 'A fake error.'
                });

            const pn = new PushNotifications({
                instanceId: '1234',
                secretKey: '1234'
            });
            pn.publish(['donuts'], {}).catch(e => {
                expect(e).to.exist;
                expect(e.message).to.contain('A fake error.');
            });
        });
    });
});
