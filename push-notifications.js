const http = require('http');

const SDK_VERSION = '0.9.0';
const INTERESTS_REGEX = new RegExp('^(_|=|@|,|\\.|:|[A-Z]|[a-z]|[0-9])*$');
const INTERESTS_MAX_LENGTH = 164;

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

PushNotifications.prototype.publish = function(publishRequest) {
    if (publishRequest === undefined) {
        throw new Error('publishRequest argument is required');
    }
    if (!publishRequest.hasOwnProperty('interests')) {
        throw new Error('"interests" is required in publishRequest');
    }
    if (publishRequest.interests.length < 1) {
        throw new Error(
            'Publish requests must target at least one interest to be delivered.'
        );
    }
    for (const interest of publishRequest.interests) {
        if (typeof interest !== 'string') {
            throw new Error(`interest ${interest} is not a string`);
        }
        if (interest.length > INTERESTS_MAX_LENGTH) {
            throw new Error(
                `interest ${interest} is longer than the maxium of ` +
                    `${INTERESTS_MAX_LENGTH} characters`
            );
        }
        if (interest.includes('-')) {
            throw new Error(
                `interest "${interest}" contains a "-" which is forbidden. ` +
                    'Have you considered using a "_" instead?'
            );
        }
        if (!INTERESTS_REGEX.exec(interest)) {
            throw new Error(
                `interest "${interest}" contains a forbidden character. ` +
                    'Allowed characters are: ASCII upper/lower-case letters, ' +
                    'numbers or one of _=@,.:'
            );
        }
    }

    const payload = JSON.stringify(publishRequest);
    const options = {
        host: this.endpoint,
        path: `/publish_api/v1/instances/${this.instanceId}/publishes`,
        port: 80,
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
        const request = http.request(options, response => {
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
