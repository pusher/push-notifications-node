[![Build](https://github.com/pusher/push-notifications-node/actions/workflows/build.yml/badge.svg)](https://github.com/pusher/push-notifications-node/actions/workflows/build.yml) [![npm](https://img.shields.io/npm/v/@pusher/push-notifications-server)](https://www.npmjs.com/package/@pusher/push-notifications-server) [![npm](https://img.shields.io/npm/dm/@pusher/push-notifications-server)](https://www.npmjs.com/package/@pusher/push-notifications-server)
# Pusher Beams Node.js Server SDK
Full documentation for this SDK can be found [here](https://docs.pusher.com/beams/reference/server-sdk-node)

## Installation
The Beams Node.js server SDK is available on npm [here](https://www.npmjs.com/package/@pusher/push-notifications-server).

You can install this SDK by using [npm](https://npmjs.com):
```bash
$ npm install @pusher/push-notifications-server --save
```

Or [yarn](https://yarnpkg.com/) if you prefer:
```bash
$ yarn add @pusher/push-notifications-server
```

## Usage
### Configuring the SDK for Your Instance
Use your instance id and secret (you can get these from the [dashboard](https://dash.pusher.com/beams)) to create a Beams PushNotifications instance:
```javascript
const PushNotifications = require('@pusher/push-notifications-server');

let pushNotifications = new PushNotifications({
  instanceId: 'YOUR_INSTANCE_ID_HERE',
  secretKey: 'YOUR_SECRET_KEY_HERE'
});
```

### Publishing a Notification
Once you have created your Beams PushNotifications instance, you can immediately publish a push notification to your devices, using [Device Interests](https://docs.pusher.com/beams/concepts/device-interests):
```javascript
pushNotifications.publishToInterests(['hello'], {
  apns: {
    aps: {
      alert: 'Hello!'
    }
  },
  fcm: {
    notification: {
      title: 'Hello',
      body: 'Hello, world!'
    }
  }
}).then((publishResponse) => {
  console.log('Just published:', publishResponse.publishId);
}).catch((error) => {
  console.log('Error:', error);
});
```
