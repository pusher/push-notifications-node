require('jest');
const jwt = require('jsonwebtoken');
const PushNotifications = require('../push-notifications.js');
const { USERS_STRING_MAX_LENGTH } = require('../utils');

describe('generateToken', () => {
    let pn;
    beforeEach(() => {
        pn = new PushNotifications({
            instanceId: '12345',
            secretKey: '12345'
        });
    });

    it('should fail if no user id is provided', () => {
        expect(() => pn.generateToken()).toThrow('userId argument is required');
    });

    it('should fail if no user id is the empty string', () => {
        expect(() => pn.generateToken('')).toThrow(
            'userId cannot be the empty string'
        );
    });

    it('should fail if the user id exceeds the permitted max length', () => {
        expect(() => pn.generateToken('a'.repeat(165))).toThrow(
            `userId is longer than the maximum length of ${USERS_STRING_MAX_LENGTH}`
        );
    });

    it('should fail if the user if is not a string', () => {
        const userId = false;
        expect(() => pn.generateToken(userId).toThrow(
            'userId must be a string'
        ));
    });

    it('should return a valid JWT token if everything is correct', () => {
        const userId = 'hermione.granger@hogwarts.ac.uk';
        const options = {
            expiresIn: '24h',
            issuer: `https://${pn.instanceId}.pushnotifications.pusher.com`,
            subject: userId
        };
        const expected = {
            token: jwt.sign({}, pn.secretKey, options)
        };
        const actual = pn.generateToken(userId);
        expect(expected).toEqual(actual);
    });
});
