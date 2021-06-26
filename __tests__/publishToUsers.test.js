require('jest');
const nock = require('nock');
const PushNotifications = require('../push-notifications.js');
const { randomValueHex, USERS_ARRAY_MAX_LENGTH } = require('../utils');

describe('publishToUsers', () => {
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
        const response = pn.publishToUsers(['harry.potter@hogwarts.ac.uk'], {
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
                '/publish_api/v1/instances/INSTANCE_ID/publishes/users'
            );
            expect(headers).toEqual({
                accept: 'application/json',
                'content-type': 'application/json',
                'content-length': 72,
                authorization: 'Bearer SECRET_KEY',
                'x-pusher-library': 'pusher-push-notifications-node 1.2.4',
                host: 'instance_id.pushnotifications.pusher.com'
            });
            expect(body).toEqual({
                users: ['harry.potter@hogwarts.ac.uk'],
                apns: {
                    aps: {
                        alert: 'Hi!'
                    }
                }
            });
        });
    });

    it('should succeed if there are 1000 users', () => {
        nock(new RegExp('/.*/'))
            .post(new RegExp('/.*/'))
            .reply(() => {
                return [200, { publishId: '123456' }];
            });

        let users = [];
        for (let i = 0; i < USERS_ARRAY_MAX_LENGTH; i++) {
            users.push(randomValueHex(15));
        }
        return expect(pn.publishToUsers(users, {})).resolves.toBeTruthy();
    });

    it('should fail if no users nor publishRequest are passed', () => {
        return expect(pn.publishToUsers()).rejects.toThrow(
            'users argument is required'
        );
    });

    it('should fail if users parameter passed is not an array', () => {
        return expect(
            pn.publishToUsers('harry.potter@hogwarts.ac.uk')
        ).rejects.toThrowError('users argument is must be an array');
    });

    it('should fail if no publishRequest is passed', () => {
        return expect(
            pn.publishToUsers(['harry.potter@hogwarts.ac.uk'])
        ).rejects.toThrowError('publishRequest argument is required');
    });

    it('should fail if too many users are passed', () => {
        let users = [];
        for (let i = 0; i < USERS_ARRAY_MAX_LENGTH + 1; i++) {
            users.push(randomValueHex(15));
        }
        return expect(pn.publishToUsers(users, {})).rejects.toThrow();
    });

    it('should fail if too few users are passed', () => {
        let users = [];
        return expect(pn.publishToUsers(users, {})).rejects.toThrow();
    });

    it('should fail if a user is not a string', () => {
        return expect(
            pn.publishToUsers(['good_user', false], {})
        ).rejects.toThrow();
    });
});
