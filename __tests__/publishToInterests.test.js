require('jest');
const nock = require('nock');
const PushNotifications = require('../push-notifications.js');
const { randomValueHex, INTEREST_ARRAY_MAX_LENGTH } = require('../utils');

describe('publishToInterests', () => {
    let pn;

    beforeEach(function() {
        nock.cleanAll();
        pn = new PushNotifications({
            instanceId: '1234',
            secretKey: '1234'
        });
    });

    afterEach(function() {
        nock.cleanAll();
        nock.enableNetConnect();
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
        const response = pn.publishToInterests(['donuts'], {
            apns: {
                aps: {
                    alert: 'Hi!'
                }
            }
        });

        return response.then(data => {
            expect(data).toEqual({
                publishId: '123456'
            });
            expect(uri).toEqual(
                '/publish_api/v1/instances/INSTANCE_ID/publishes/interests'
            );
            expect(headers).toEqual({
                authorization: 'Bearer SECRET_KEY',
                accept: 'application/json',
                'x-pusher-library': 'pusher-push-notifications-node 1.2.4',
                host: 'instance_id.pushnotifications.pusher.com',
                'content-type': 'application/json',
                'content-length': 55
            });
            expect(body).toEqual({
                interests: ['donuts'],
                apns: {
                    aps: {
                        alert: 'Hi!'
                    }
                }
            });
        });
    });

    it('should work with the `publish` alias', () => {
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
            expect(data).toEqual({
                publishId: '123456'
            });
            expect(uri).toEqual(
                '/publish_api/v1/instances/INSTANCE_ID/publishes/interests'
            );
            expect(headers).toEqual({
                accept: 'application/json',
                'content-type': 'application/json',
                'content-length': 55,
                authorization: 'Bearer SECRET_KEY',
                'x-pusher-library': 'pusher-push-notifications-node 1.2.4',
                host: 'instance_id.pushnotifications.pusher.com'
            });
            expect(body).toEqual({
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
        return expect(pn.publishToInterests()).rejects.toThrowError(
            'interests argument is required'
        );
    });

    it('should fail if interests parameter passed is not an array', () => {
        return expect(pn.publishToInterests('donuts')).rejects.toThrowError(
            'interests argument is must be an array'
        );
    });

    it('should fail if no publishRequest is passed', () => {
        return expect(pn.publishToInterests(['donuts'])).rejects.toThrowError(
            'publishRequest argument is required'
        );
    });

    it('should fail if no interests are passed', () => {
        return expect(pn.publishToInterests([], {})).rejects.toThrowError(
            'Publish requests must target at least one interest to be delivered'
        );
    });

    it('should fail if too many interests are passed', () => {
        let interests = [];
        for (let i = 0; i < INTEREST_ARRAY_MAX_LENGTH + 1; i++) {
            interests.push(randomValueHex(15));
        }
        return expect(
            pn.publishToInterests(interests, {})
        ).rejects.toThrowError(
            `Number of interests (${INTEREST_ARRAY_MAX_LENGTH +
                1}) exceeds maximum of ${INTEREST_ARRAY_MAX_LENGTH}`
        );
    });

    it('should succeed if there are 100 interests', () => {
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

        let interests = [];
        for (let i = 0; i < 100; i++) {
            interests.push(randomValueHex(15));
        }
        return pn
            .publishToInterests(interests, {
                apns: {
                    aps: {
                        alert: 'Hi!'
                    }
                }
            })
            .then(res => {
                expect(uri).toEqual(
                    '/publish_api/v1/instances/1234/publishes/interests'
                );
                expect(headers).toEqual({
                    accept: 'application/json',
                    'content-type': 'application/json',
                    'content-length': 1846,
                    authorization: 'Bearer 1234',
                    'x-pusher-library': 'pusher-push-notifications-node 1.2.4',
                    host: '1234.pushnotifications.pusher.com'
                });
                expect(body).toEqual({
                    interests,
                    apns: {
                        aps: {
                            alert: 'Hi!'
                        }
                    }
                });
                expect(res).toEqual({ publishId: '123456' });
            });
    });

    it('should fail if an interest is not a string', () => {
        return expect(
            pn.publishToInterests(['good_interest', false], {})
        ).rejects.toThrowError('interest false is not a string');
    });

    it('should fail if an interest is too long', () => {
        return expect(
            pn.publishToInterests(['good_interest', 'a'.repeat(165)], {})
        ).rejects.toThrowError(/is longer than the maximum of 164 characters/);
    });

    it('should fail if an interest contains invalid characters', () => {
        return pn
            .publishToInterests(['good-interest', 'bad|interest'], {})
            .catch(error => {
                expect(error.message).toMatch(/contains a forbidden character/);
                return pn.publish(['good-interest', 'bad:interest'], {});
            })
            .catch(error => {
                expect(error.message).toMatch(/contains a forbidden character/);
            });
    });

    it('should reject the returned promise on network error', () => {
        nock.disableNetConnect();
        return expect(
            pn.publishToInterests(['donuts'], {})
        ).rejects.toThrowError();
    });

    it('should reject the returned promise on HTTP error', () => {
        nock(new RegExp('/.*/'))
            .post(new RegExp('/.*/'))
            .reply(400, {
                error: 'Fake error',
                description: 'A fake error.'
            });

        return expect(
            pn.publishToInterests(['donuts'], {})
        ).rejects.toThrowError('A fake error');
    });

    it('should reject the returned promise if response is not JSON (success)', () => {
        nock(new RegExp('/.*/'))
            .post(new RegExp('/.*/'))
            .reply(200, 'thisisnotjson{{{{{');

        return expect(
            pn.publishToInterests(['donuts'], {})
        ).rejects.toThrowError('Could not parse response body');
    });

    it('should reject the returned promise if response is not JSON (failure)', () => {
        nock(new RegExp('/.*/'))
            .post(new RegExp('/.*/'))
            .reply(500, 'thisisnotjson{{{{{');

        return pn.publishToInterests(['donuts'], {}).catch(e => {
            expect(e).toEqual(new Error('Could not parse response body'));
        });
    });

    it('should reject the returned promise if error response has an unexpected schema', () => {
        nock(new RegExp('/.*/'))
            .post(new RegExp('/.*/'))
            .reply(500, { notError: 'nope', noDescription: 'here' });

        return pn.publishToInterests(['donuts'], {}).catch(e => {
            expect(e).toEqual(new Error('Could not parse response body'));
        });
    });
});
