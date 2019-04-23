const request = require('request-promise-native');
const jwt = require('jsonwebtoken');

const SDK_VERSION = '1.2.0';
const INTERESTS_REGEX = new RegExp('^(_|\\-|=|@|,|\\.|;|[A-Z]|[a-z]|[0-9])*$');
const {
    INTEREST_STRING_MAX_LENGTH,
    INTEREST_ARRAY_MAX_LENGTH,
    USERS_ARRAY_MAX_LENGTH,
    USERS_STRING_MAX_LENGTH
} = require('./utils');

function PushNotifications(options) {
    if (options === null || typeof options !== 'object') {
        throw new Error('PushNotifications options object is required');
    }
    if (!options.hasOwnProperty('instanceId')) {
        throw new Error(
            '"instanceId" is required in PushNotifications options'
        );
    }
    if (typeof options.instanceId !== 'string') {
        throw new Error('"instanceId" must be a string');
    }
    if (!options.hasOwnProperty('secretKey')) {
        throw new Error('"secretKey" is required in PushNotifications options');
    }
    if (typeof options.secretKey !== 'string') {
        throw new Error('"secretKey" must be a string');
    }
    this.instanceId = options.instanceId;
    this.secretKey = options.secretKey;

    if (!options.hasOwnProperty('endpoint')) {
        this.protocol = 'https';
        this.endpoint = `${this.instanceId}.pushnotifications.pusher.com`;
    } else if (typeof options.endpoint !== 'string') {
        throw new Error('endpoint must be a string');
    } else {
        this.protocol = 'http';
        this.endpoint = options.endpoint;
    }

    this._baseRequest = request.defaults({
        headers: {
            Authorization: `Bearer ${this.secretKey}`,
            'X-Pusher-Library': `pusher-push-notifications-node ${SDK_VERSION}`
        },
        json: true,
        simple: true,
        resolveWithFullResponse: true
    });
}

/**
 * Alias of publishToInterests
 * @deprecated Use publishToInterests instead
 */

PushNotifications.prototype.publish = function(interests, publishRequest) {
    console.warn('`publish` is deprecated. Use `publishToInterests` instead.');
    return this.publishToInterests(interests, publishRequest);
};

PushNotifications.prototype.generateToken = function(userId) {
    if (userId === undefined || userId === null) {
        throw new Error('userId argument is required');
    }
    if (userId === '') {
        throw new Error('userId cannot be the empty string');
    }
    if (typeof userId !== 'string') {
        throw new Error('userId must be a string');
    }
    if (userId.length > USERS_STRING_MAX_LENGTH) {
        throw new Error(
            `userId is longer than the maximum length of ${USERS_STRING_MAX_LENGTH}`
        );
    }
    const options = {
        expiresIn: '24h',
        issuer: `https://${this.instanceId}.pushnotifications.pusher.com`,
        subject: userId
    };
    const token = jwt.sign({}, this.secretKey, options);

    return {
        token: token
    };
};

PushNotifications.prototype.publishToInterests = function(
    interests,
    publishRequest
) {
    if (interests === undefined || interests === null) {
        return Promise.reject(new Error('interests argument is required'));
    }
    if (!(interests instanceof Array)) {
        return Promise.reject(
            new Error('interests argument is must be an array')
        );
    }
    if (interests.length < 1) {
        return Promise.reject(
            new Error(
                'Publish requests must target at least one interest to be delivered'
            )
        );
    }
    if (interests.length > INTEREST_ARRAY_MAX_LENGTH) {
        return Promise.reject(
            new Error(
                `Number of interests (${
                    interests.length
                }) exceeds maximum of ${INTEREST_ARRAY_MAX_LENGTH}.`
            )
        );
    }
    if (publishRequest === undefined || publishRequest === null) {
        return Promise.reject(new Error('publishRequest argument is required'));
    }
    for (const interest of interests) {
        if (typeof interest !== 'string') {
            return Promise.reject(
                new Error(`interest ${interest} is not a string`)
            );
        }
        if (interest.length > INTEREST_STRING_MAX_LENGTH) {
            return Promise.reject(
                new Error(
                    `interest ${interest} is longer than the maximum of ` +
                        `${INTEREST_STRING_MAX_LENGTH} characters`
                )
            );
        }
        if (!INTERESTS_REGEX.test(interest)) {
            return Promise.reject(
                new Error(
                    `interest "${interest}" contains a forbidden character. ` +
                        'Allowed characters are: ASCII upper/lower-case letters, ' +
                        'numbers or one of _-=@,.;'
                )
            );
        }
    }

    const body = Object.assign({}, publishRequest, { interests });
    const options = {
        uri: `${this.protocol}://${this.endpoint}/publish_api/v1/instances/${
            this.instanceId
        }/publishes/interests`,
        method: 'POST',
        body,
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(JSON.stringify(body))
        }
    };

    return doRequest(this._baseRequest, options);
};

PushNotifications.prototype.publishToUsers = function(users, publishRequest) {
    if (users === undefined || users === null) {
        return Promise.reject(new Error('users argument is required'));
    }
    if (!(users instanceof Array)) {
        return Promise.reject(new Error('users argument is must be an array'));
    }
    if (users.length < 1) {
        return Promise.reject(
            new Error(
                'Publish requests must target at least one interest to be delivered'
            )
        );
    }
    if (users.length > USERS_ARRAY_MAX_LENGTH) {
        return Promise.reject(
            new Error(
                `Number of users (${
                    users.length
                }) exceeds maximum of ${USERS_ARRAY_MAX_LENGTH}.`
            )
        );
    }
    if (publishRequest === undefined || publishRequest === null) {
        return Promise.reject(new Error('publishRequest argument is required'));
    }
    for (const user of users) {
        if (typeof user !== 'string') {
            return Promise.reject(new Error(`user ${user} is not a string`));
        }
        if (user.length > INTEREST_STRING_MAX_LENGTH) {
            return Promise.reject(
                new Error(
                    `user ${user} is longer than the maximum of ` +
                        `${INTEREST_STRING_MAX_LENGTH} characters`
                )
            );
        }
    }

    const body = Object.assign({}, publishRequest, { users });
    const options = {
        uri: `${this.protocol}://${this.endpoint}/publish_api/v1/instances/${
            this.instanceId
        }/publishes/users`,
        method: 'POST',
        body,
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(JSON.stringify(body))
        }
    };

    return doRequest(this._baseRequest, options);
};

PushNotifications.prototype.deleteUser = function(userId) {
    if (userId === undefined || userId === null) {
        return Promise.reject(new Error('User ID argument is required'));
    }
    if (typeof userId !== 'string') {
        return Promise.reject(new Error('User ID argument must be a string'));
    }
    if (userId.length > USERS_STRING_MAX_LENGTH) {
        return Promise.reject(new Error('User ID argument is too long'));
    }

    const options = {
        uri: `${this.protocol}://${this.endpoint}/user_api/v1/instances/${
            this.instanceId
        }/users/${encodeURIComponent(userId)}`,
        method: 'DELETE'
    };

    return doRequest(this._baseRequest, options);
};

function isJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}
function isValidJson(value) {
    if (typeof value === 'object' || typeof value === 'number') {
        return true;
    }
    if (typeof value === 'string') {
        return isJsonString(value);
    }
    return false;
}

function doRequest(baseRequest, options) {
    return baseRequest(options)
        .then(res => {
            if (res.body) {
                const err = new Error('Could not parse response body');
                return isValidJson(res.body)
                    ? Promise.resolve(res.body)
                    : Promise.reject(err);
            }
            return Promise.resolve();
        })
        .catch(err => {
            if (err.name === 'StatusCodeError') {
                let errorMessage;
                let failureMessage = 'Could not parse response body';
                try {
                    errorMessage =
                        typeof err.error === 'object'
                            ? err.error
                            : JSON.parse(err.error);
                } catch (e) {
                    return Promise.reject(new Error(failureMessage));
                }
                if (
                    !(
                        errorMessage.hasOwnProperty('error') &&
                        errorMessage.hasOwnProperty('description')
                    )
                ) {
                    return Promise.reject(new Error(failureMessage));
                }

                return Promise.reject(
                    new Error(
                        `${err.statusCode} ${err.error.error} - ${
                            err.error.description
                        }`
                    )
                );
            }

            if (err instanceof Error) {
                return Promise.reject(err);
            }
            return Promise.reject(new Error(err));
        });
}

module.exports = PushNotifications;
