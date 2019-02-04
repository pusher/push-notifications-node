const PushNotifications = require('./push-notifications.js');

let beamsClient = new PushNotifications({
    instanceId: '8f9a6e22-2483-49aa-8552-125f1a4c5781',
    secretKey: 'C54D42FB7CD2D408DDB22D7A0166F1D'
});

beamsClient
    .publishToInterests(['donuts'], {
        apns: {
            aps: {
                alert: 'Hi!'
            }
        }
    })
    .then(response => {
        console.log('Response:', response);
    })
    .catch(error => {
        console.error('Error:', error);
    });

beamsClient
    .publishToUsers(['user-12345'], {
        fcm: {
            notification: {
                title: 'Hello, world!',
                notification: 'What a time to be alive'
            }
        }
    })
    .then(response => {
        console.log('Response:', response);
    })
    .catch(error => {
        console.error('Error:', error);
    });
