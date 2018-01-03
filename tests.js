const expect = require('chai').expect;
const nock = require('nock');

const PushNotifications = require('./PushNotifications.js');

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
            const response = pn.publish({
                interests: ['donuts'],
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
                    'x-pusher-library': 'pusher-push-notifications-node 0.9.0',
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

        it('should fail if no publishRequest is passed', () => {
            const pn = new PushNotifications({
                instanceId: '1234',
                secretKey: '1234'
            });
            expect(() => pn.publish()).to.throw();
        });

        it('should fail if no interests are passed', () => {
            const pn = new PushNotifications({
                instanceId: '1234',
                secretKey: '1234'
            });
            expect(() => pn.publish({})).to.throw();
            expect(() => pn.publish({ interests: [] })).to.throw();
        });

        it('should fail if an interest is not a string', () => {
            const pn = new PushNotifications({
                instanceId: '1234',
                secretKey: '1234'
            });
            expect(() =>
                pn.publish({
                    interests: ['good_interest', false]
                })
            ).to.throw();
        });

        it('should fail if an interest is too long', () => {
            const pn = new PushNotifications({
                instanceId: '1234',
                secretKey: '1234'
            });
            expect(() =>
                pn.publish({
                    interests: ['good_interest', 'a'.repeat(165)]
                })
            ).to.throw();
        });

        it('should fail if an interest contains invalid characters', () => {
            const pn = new PushNotifications({
                instanceId: '1234',
                secretKey: '1234'
            });
            expect(() =>
                pn.publish({
                    interests: ['good_interest', 'bad-interest']
                })
            ).to.throw();
            expect(() =>
                pn.publish({
                    interests: ['good_interest', 'bad(interest)']
                })
            ).to.throw();
        });

        it('should reject the returned promise on network error', () => {
            nock.disableNetConnect();
            const pn = new PushNotifications({
                instanceId: '1234',
                secretKey: '1234'
            });
            pn
                .publish({
                    interests: ['donuts']
                })
                .catch(e => {
                    expect(e).to.exist;
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
            pn
                .publish({
                    interests: ['donuts']
                })
                .catch(e => {
                    expect(e).to.exist;
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
            pn
                .publish({
                    interests: ['donuts']
                })
                .catch(e => {
                    expect(e).to.exist;
                });
        });
    });
});
