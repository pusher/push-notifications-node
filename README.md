[![Build Status](https://travis-ci.org/pusher/push-notifications-node.svg?branch=master)](https://travis-ci.org/pusher/push-notifications-node)
# Pusher Push Notifications Node.js Server SDK
Full documentation for this SDK can be found [here](https://docs.pusher.com/push-notifications/reference/server-sdk-node)

## Installation
The Pusher Notifications Node.js server SDK is available on npm [here](https://www.npmjs.com/package/pusher-push-notifications-node).

You can install this SDK by using [npm](https://npmjs.com):
```bash
$ npm install pusher-push-notifications-node --save
```

Or [yarn](https://yarnpkg.com/) if you prefer:
```bash
$ yarn add pusher-push-notifications-node
```

## Usage
### Configuring the SDK for Your Instance
Use your instance id and secret (you can get these from the [dashboard](https://dash.pusher.com)) to create a PushNotifications instance:
```javascript
const PushNotifications = require('pusher-push-notifications-node');

let pushNotifications = new PushNotifications({
  instanceId: 'YOUR_INSTANCE_ID_HERE',
  secretKey: 'YOUR_SECRET_KEY_HERE'
});
```

### Publishing a Notification
Once you have created your PushNotifications instance you can publish a push notification to your registered & subscribed devices:
```javascript
pushNotifications.publish(['hello'], {
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
