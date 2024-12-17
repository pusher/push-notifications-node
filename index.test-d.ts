import { expectType } from 'tsd';
import { createSecretKey, randomFillSync} from 'crypto';

import PushNotifications = require('.');

const secretKey = createSecretKey(randomFillSync(Buffer.alloc(32))).export().toString('hex');

// Create a client
const client = new PushNotifications({
    instanceId: 'some-instance-id',
    secretKey: secretKey
});

// Publish to interests
expectType<Promise<PushNotifications.PublishResponse>>(
    client.publishToInterests(['hello'], {
        apns: {
            aps: {
                alert: {
                    title: 'title',
                    body: 'body'
                }
            }
        },
        fcm: {
            notification: {
                title: 'title',
                body: 'body'
            }
        },
        web: {
            notification: {
                title: 'title',
                body: 'body'
            }
        }
    })
);

// Publish to users
expectType<Promise<PushNotifications.PublishResponse>>(
    client.publishToUsers(['user-alice'], {
        apns: {
            aps: {
                alert: {
                    title: 'title',
                    body: 'body'
                }
            }
        },
        fcm: {
            notification: {
                title: 'title',
                body: 'body'
            }
        },
        web: {
            notification: {
                title: 'title',
                body: 'body'
            }
        }
    })
);

// Generate Beams token
expectType<{token: PushNotifications.Token}>(client.generateToken('user-alice'));

// Delete User
expectType<Promise<void>>(client.deleteUser('user-alice'));
