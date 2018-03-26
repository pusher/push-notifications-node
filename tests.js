const expect = require('chai').expect;
const nock = require('nock');
const crypto = require('crypto');

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
        let pn;

        beforeEach(function() {
            pn = new PushNotifications({
                instanceId: '1234',
                secretKey: '1234'
            });
        });

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
                    'x-pusher-library': 'pusher-push-notifications-node 0.10.2',
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
            expect(() => pn.publish()).to.throw(
                'interests argument is required'
            );
        });

        it('should fail if interests parameter passed is not an array', () => {
            expect(() => pn.publish('donuts')).to.throw(
                'interests argument is must be an array'
            );
        });

        it('should fail if no publishRequest is passed', () => {
            expect(() => pn.publish(['donuts'])).to.throw(
                'publishRequest argument is required'
            );
        });

        it('should fail if no interests are passed', () => {
            expect(() => pn.publish([], {})).to.throw(
                'Publish requests must target at least one interest to be delivered'
            );
        });

        it('should fail if too many interests are passed', () => {
            let interests = [];
            const MAX_INTERESTS = 100;
            for (let i = 0; i < MAX_INTERESTS + 1; i++) {
                interests.push(randomValueHex(15));
            }
            expect(() => pn.publish(interests, {})).to.throw();
        });

        it('should succeed if there are 100 interests', () => {
            let interests = [];
            for (let i = 0; i < 100; i++) {
                interests.push(randomValueHex(15));
            }
            expect(() => pn.publish(interests, {})).to.be.ok;
        });

        it('should fail if an interest is not a string', () => {
            expect(() => pn.publish(['good_interest', false], {})).to.throw(
                'interest false is not a string'
            );
        });

        it('should fail if an interest is too long', () => {
            expect(() =>
                pn.publish(['good_interest', 'a'.repeat(165)], {})
            ).to.throw('is longer than the maximum of 164 characters');
        });

        it('should fail if an interest contains invalid characters', () => {
            expect(() =>
                pn.publish(['good-interest', 'bad|interest'], {})
            ).to.throw('contains a forbidden character');
        });

        it('should reject the returned promise on network error', () => {
            nock.disableNetConnect();

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

            pn.publish(['donuts'], {}).catch(e => {
                expect(e).to.exist;
                expect(e.message).to.contain('A fake error.');
            });
        });
    });
});

//function code taken from http://blog.tompawlak.org/how-to-generate-random-values-nodejs-javascript
function randomValueHex(len) {
    return crypto
        .randomBytes(Math.ceil(len / 2))
        .toString('hex') // convert to hexadecimal format
        .slice(0, len)
        .toUpperCase(); // return required number of characters
}
