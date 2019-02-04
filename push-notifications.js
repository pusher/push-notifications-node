const https = require('https');
const jwt = require('jsonwebtoken');

const SDK_VERSION = '1.0.1';
const INTERESTS_REGEX = new RegExp('^(_|\\-|=|@|,|\\.|;|[A-Z]|[a-z]|[0-9])*$');
const INTEREST_STRING_MAX_LENGTH = 164;
const INTEREST_ARRAY_MAX_LENGTH = 100;
const USERS_ARRAY_MAX_LENGTH = 1000;
const USERS_STRING_MAX_LENGTH = 164;

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
        this.endpoint = `${this.instanceId}.pushnotifications.pusher.com`;
    } else if (typeof options.endpoint !== 'string') {
        throw new Error('endpoint must be a string');
    } else {
        this.endpoint = options.endpoint;
    }
}

// Alias of publishToInterests
PushNotifications.prototype.publish = function(interests, publishRequest) {
    return this.publishToInterests(interests, publishRequest);
};

PushNotifications.prototype.generateToken = function(userId) {
    if (userId === undefined || userId === null) {
        throw new Error('userId argument is required');
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
    return jwt.sign({}, this.secretKey, options);
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

    publishRequest.interests = interests;
    const payload = JSON.stringify(publishRequest);
    const options = {
        host: this.endpoint,
        path: `/publish_api/v1/instances/${
            this.instanceId
        }/publishes/interests`,
        port: 443,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(payload),
            Authorization: `Bearer ${this.secretKey}`,
            'X-Pusher-Library': `pusher-push-notifications-node ${SDK_VERSION}`
        }
    };

    return doRequest(payload, options);
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

    publishRequest.users = users;
    const payload = JSON.stringify(publishRequest);
    const options = {
        host: this.endpoint,
        path: `/publish_api/v1/instances/${this.instanceId}/publishes/users`,
        port: 443,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(payload),
            Authorization: `Bearer ${this.secretKey}`,
            'X-Pusher-Library': `pusher-push-notifications-node ${SDK_VERSION}`
        }
    };

    return doRequest(payload, options);
};

PushNotifications.prototype.deleteUser = function(userId) {
    if (userId === undefined || userId === null) {
        return Promise.reject(new Error('User ID argument is required'));
    }
    if (userId.length > USERS_STRING_MAX_LENGTH) {
        return Promise.reject(new Error('User ID argument is too long'));
    }

    const options = {
        host: this.endpoint,
        path: `user_api/v1/instances/${
            this.instanceId
        }/users/${encodeURIComponent(userId)}`,
        port: 443,
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${this.secretKey}`,
            'X-Pusher-Library': `pusher-push-notifications-node ${SDK_VERSION}`
        }
    };

    return doRequest(undefined, options);
};

function doRequest(payload, options) {
    return new Promise((resolve, reject) => {
        const request = https.request(options, response => {
            const wasSuccessful = response.statusCode === 200;
            let responseString = '';
            response.setEncoding('utf8');

            response.on('data', function(chunk) {
                responseString += chunk;
            });
            response.on('error', function() {
                reject(new Error('Unknown error - invalid server response'));
            });
            response.on('end', function() {
                let responseBody;
                try {
                    if (responseString.length > 0) {
                        responseBody = JSON.parse(responseString);
                    }
                } catch (e) {
                    return reject(
                        new Error('Unknown error - invalid server response')
                    );
                }

                if (wasSuccessful) {
                    resolve(responseBody);
                } else {
                    const errorType = responseBody.error || 'Unknown error';
                    const errorDescription =
                        responseBody.description || 'No description';
                    const errorString = `${errorType}:${errorDescription}`;
                    reject(new Error(errorString));
                }
            });
        });
        request.on('error', function(error) {
            reject(error);
        });

        if (payload) {
            request.write(payload);
        }
        request.end();
    });
}

module.exports = PushNotifications;
