const crypto = require('crypto');

// function code taken from http://blog.tompawlak.org/how-to-generate-random-values-nodejs-javascript
function randomValueHex(len) {
    return crypto
        .randomBytes(Math.ceil(len / 2))
        .toString('hex')
        .slice(0, len)
        .toUpperCase();
}

const USERS_STRING_MAX_LENGTH = 164;
const INTEREST_STRING_MAX_LENGTH = 164;
const USERS_ARRAY_MAX_LENGTH = 1000;
const INTEREST_ARRAY_MAX_LENGTH = 100;

module.exports = {
    randomValueHex,
    USERS_STRING_MAX_LENGTH,
    INTEREST_STRING_MAX_LENGTH,
    USERS_ARRAY_MAX_LENGTH,
    INTEREST_ARRAY_MAX_LENGTH
};
