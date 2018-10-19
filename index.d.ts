declare module '@pusher/push-notifications-server' {
    class PushNotifications {
        constructor(options: PushNotifications.PushNotificationsOptions);
        /**
         *
         * @param interests Array of interests to send the push notification to, ranging from 1 to 100 per publish request.
         * @param publishRequest
         */
        publish<T extends PushNotifications.PublishRequestBase>(
            interests: string[],
            publishRequest: PushNotifications.PublishRequest
        ): Promise<PushNotifications.PublishResponse>;
    }
    namespace PushNotifications {
        export interface PushNotificationsOptions {
            instanceId: string;
            secretKey: string;
            endpoint?: string;
        }
        export interface PublishRequestBase {
            /* A URL to which we will send webhooks at key points throughout the publishing process. E.g when the publish finishes */
            webhookUrl?: string;
            apns?: ApnsPayload;
            fcm?: FcmPayload;
        }
        export interface PublishRequestWithApns extends PublishRequestBase {
            apns: ApnsPayload;
        }
        export interface PublishRequestWithFcm extends PublishRequestBase {
            fcm: FcmPayload;
        }
        export type PublishRequest =
            | PublishRequestWithFcm
            | PublishRequestWithApns;
        export interface FcmPayload {
            /* This parameter specifies the predefined, user-visible key-value pairs of the notification payload */
            notification?: object;
            /* This parameter specifies the custom key-value pairs of the message's payload */
            data?: object;
        }
        export interface ApnsPayload {
            aps: ApsPayload;
        }
        export interface ApsPayload {
            /**
             * Include this key when you want the system to display a standard alert or a banner. The notification settings
             * for your app on the user’s device determine whether an alert or banner is displayed.
             */
            alert?: string | AlertPayload;
            /**
             * Include this key when you want the system to modify the badge of your app icon.
             * If this key is not included in the dictionary, the badge is not changed. To remove
             * the badge, set the value of this key to 0
             */
            badge?: number;
            /**
             * Include this key when you want the system to play a sound. The value of this key is the name of a sound file
             * in your app’s main bundle or in the Library/Sounds folder of your app’s data container. If the sound file cannot
             * be found, or if you specify defaultfor the value, the system plays the default alert sound.
             */
            sound?: string;
            /**
             * Provide this key with a string value that represents the notification’s type. This value corresponds to the
             * value in the identifier property of one of your app’s registered categories.
             */
            category?: string;
        }
        export interface AlertPayload {
            /**
             * A short string describing the purpose of the notification. Apple Watch displays this string as part of the notification interface.
             * This string is displayed only briefly and should be crafted so that it can be understood quickly. This key was added in iOS 8.2.
             */
            title: string;
            /* The text of the alert message */
            body: string;
        }
        export interface PublishResponse {
            /* Unique string used to identify this publish request */
            publishId: string;
        }
    }
    export = PushNotifications;
}
