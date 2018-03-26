const https = require('https');

const SDK_VERSION = '0.10.2';
const INTERESTS_REGEX = new RegExp('^(_|\\-|=|@|,|\\.|:|[A-Z]|[a-z]|[0-9])*$');
const INTEREST_STRING_MAX_LENGTH = 164;
const INTEREST_ARRAY_MAX_LENGTH = 100;

function PushNotifications(options) {
    if (typeof options !== 'object') {
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

PushNotifications.prototype.publish = function(interests, publishRequest) {
    if (interests === undefined) {
        throw new Error('interests argument is required');
    }
    if (!(interests instanceof Array)) {
        throw new Error('interests argument is must be an array');
    }
    if (interests.length < 1) {
        throw new Error(
            'Publish requests must target at least one interest to be delivered.'
        );
    }
    if (interests.length > INTEREST_ARRAY_MAX_LENGTH) {
        throw new Error(
            `Number of interests (${
                interests.length
            }) exceeds maximum of ${INTEREST_ARRAY_MAX_LENGTH}.`
        );
    }
    if (publishRequest === undefined) {
        throw new Error('publishRequest argument is required');
    }
    for (const interest of interests) {
        if (typeof interest !== 'string') {
            throw new Error(`interest ${interest} is not a string`);
        }
        if (interest.length > INTEREST_STRING_MAX_LENGTH) {
            throw new Error(
                `interest ${interest} is longer than the maximum of ` +
                    `${INTEREST_STRING_MAX_LENGTH} characters`
            );
        }
        if (!INTERESTS_REGEX.exec(interest)) {
            throw new Error(
                `interest "${interest}" contains a forbidden character. ` +
                    'Allowed characters are: ASCII upper/lower-case letters, ' +
                    'numbers or one of _-=@,.:'
            );
        }
    }

    publishRequest.interests = interests;
    const payload = JSON.stringify(publishRequest);
    const options = {
        host: this.endpoint,
        path: `/publish_api/v1/instances/${this.instanceId}/publishes`,
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

function doRequest(payload, options) {
    const promise = new Promise((resolve, reject) => {
        const request = https.request(options, response => {
            const wasSuccessful = response.statusCode === 200;
            let responseString = '';
            response.setEncoding('utf8');

            response.on('data', function(chunk) {
                responseString += chunk;
            });
            response.on('end', function() {
                const responseBody = JSON.parse(responseString);
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

        request.write(payload);
        request.end();
    });

    return promise;
}

module.exports = PushNotifications;
