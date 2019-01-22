require('jest');
const nock = require('nock');
const PushNotifications = require('../push-notifications.js');
const { USERS_STRING_MAX_LENGTH } = require('../utils');

describe('deleteUser', () => {
    let pn;

    beforeEach(() => {
        pn = new PushNotifications({
            instanceId: '1234',
            secretKey: '1234'
        });
    });

    afterEach(function() {
        nock.cleanAll();
    });

    it('should make the correct http request with valid params (no response body)', () => {
        nock(new RegExp('/.*/'))
            .delete(new RegExp('/.*/'))
            .reply(200);

        const userId = 'ron.weasley@hogwarts.ac.uk';
        return expect(pn.deleteUser(userId)).resolves.toBe(undefined);
    });

    it('should make the correct http request with valid params (with response body)', () => {
        nock(new RegExp('/.*/'))
            .delete(new RegExp('/.*/'))
            .reply(() => {
                return [200, JSON.stringify({ statusCode: 200 })];
            });

        const userId = 'ron.weasley@hogwarts.ac.uk';
        return expect(pn.deleteUser(userId)).resolves.toEqual({ statusCode: 200 });
    });

    it('should fail if no user id is provided', () => {
        expect(pn.deleteUser()).rejects.toThrowError(
            'User ID argument is required'
        );
    });

    it('should fail if the user id is too long', () => {
        const aVeryLongString = 'a'.repeat(USERS_STRING_MAX_LENGTH) + 'b';
        return expect(pn.deleteUser(aVeryLongString)).rejects.toThrowError(
            'User ID argument is too long'
        );
    });
});
