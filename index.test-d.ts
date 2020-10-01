import { expectType } from 'tsd';

import PushNotifications = require('.');

// Create a client
const client = new PushNotifications({
    instanceId: 'some-instance-id',
    secretKey: 'some-secret-key'
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
expectType<PushNotifications.Token>(client.generateToken('user-alice'));

// Delete User
expectType<Promise<void>>(client.deleteUser('user-alice'));
