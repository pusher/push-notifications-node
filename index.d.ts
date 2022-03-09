declare namespace PushNotifications {
    interface Options {
        instanceId: string;
        secretKey: string;
        endpoint?: string;
    }

    interface PublishRequestBase {
        /* A URL to which we will send webhooks at key points throughout the publishing process. E.g when the publish finishes */
        webhookUrl?: string;
    }

    interface PublishRequestWithApns extends PublishRequestBase {
        apns: ApnsPayload;
    }

    interface PublishRequestWithFcm extends PublishRequestBase {
        fcm: FcmPayload;
    }

    interface PublishRequestWithWeb extends PublishRequestBase {
        web: WebPayload;
    }

    interface PublishRequestWithApnsAndFcm extends PublishRequestBase {
        apns: ApnsPayload;
        fcm: FcmPayload;
    }

    interface PublishRequestWithApnsAndWeb extends PublishRequestBase {
        apns: ApnsPayload;
        web: WebPayload;
    }

    interface PublishRequestWithFcmAndWeb extends PublishRequestBase {
        fcm: FcmPayload;
        web: WebPayload;
    }

    interface PublishRequestWithAllPlatforms extends PublishRequestBase {
        apns: ApnsPayload;
        fcm: FcmPayload;
        web: WebPayload;
    }

    type PublishRequest =
        | PublishRequestWithApns
        | PublishRequestWithFcm
        | PublishRequestWithWeb
        | PublishRequestWithApnsAndFcm
        | PublishRequestWithApnsAndWeb
        | PublishRequestWithFcmAndWeb
        | PublishRequestWithAllPlatforms;

    interface FcmPayload {
        /**
         * Number of seconds that can pass before the notification is considered invalid and can be discarded.
         */
        time_to_live?: number;
        /**
         * Multiple notifications that have the same collapse_key will be displayed to the user as a single notification.
         * The most recent notification will be shown.
         */
        collapse_key?: string;
        /**
         * Priority of the notification. Can be one of the following values:
         *  - "normal": May be delayed to conserve device resources. (DEFAULT)
         *  - "high": Will attempt to deliver immediately.
         *     Notifications that are not displayed in the system tray may be downgraded to "normal" if sent too quickly.
         */
        priority?: 'normal' | 'high';
        /**
         * Specifies the predefined, user-visible key-value pairs of the notification payload
         */
        notification?: FcmNotificationPayload;
        /**
         * Specifies the custom key-value pairs of the message's payload
         */
        data?: object;
    }

    // See: https://firebase.google.com/docs/cloud-messaging/http-server-ref#notification-payload-support
    interface FcmNotificationPayload {
        /**
         * The notification's title.
         */
        title?: string;
        /**
         * The notification's body text.
         */
        body?: string;
        /**
         * The notification's channel id (new in Android O).
         * The app must create a channel with this channel ID before any notification with this channel ID is received.
         * If you don't send this channel ID in the request, or if the channel ID provided has not yet been created by the app,
         * FCM uses the channel ID specified in the app manifest.
         */
        android_channel_id?: string;
        /**
         * The notification's icon.
         * Sets the notification icon to myicon for drawable resource myicon.
         * If you don't send this key in the request, FCM displays the launcher icon specified in your app manifest.
         */
        icon?: string;
        /**
         * The sound to play when the device receives the notification.
         * Supports "default" or the filename of a sound resource bundled in the app. Sound files must reside in /res/raw/.
         */
        sound?: string;
        /**
         * Identifier used to replace existing notifications in the notification drawer.
         * If not specified, each request creates a new notification.
         * If specified and a notification with the same tag is already being shown, the new notification replaces the existing one in the notification drawer.
         */
        tag?: string;
        /**
         * The notification's icon color, expressed in #rrggbb format
         */
        color?: string;
        /**
         * The action associated with a user click on the notification.
         * If specified, an activity with a matching intent filter is launched when a user clicks on the notification.
         */
        click_action?: string;
        /**
         * The key to the body string in the app's string resources to use to localize the body text to the user's current localization.
         */
        body_loc_key?: string;
        /**
         * Variable string values to be used in place of the format specifiers in body_loc_key to use to localize the body text to the user's current localization.
         */
        body_loc_args?: string[];
        /**
         * The key to the title string in the app's string resources to use to localize the title text to the user's current localization.
         */
        title_loc_key?: string;
        /**
         * Variable string values to be used in place of the format specifiers in title_loc_key to use to localize the title text to the user's current localization.
         */
        title_loc_args?: string[];
    }

    interface ApnsPayload {
        /**
         * Multiple notifications that have the same collapse_id will be displayed to the user as a single notification.
         */
        collapse_id?: string;
        /**
         * Timestamp after which this notification is considered invalid and can be discarded (time since unix epoch in seconds)
         */
        expiration?: number;
        /**
         * The priority of the notification. Can be one of the following values:
         * - 10: Send the notification immediately (DEFAULT)
         * - 5: Send the notification opportunistically, taking into account efficiency concerns such as battery usage
         */
        priority?: 5 | 10;
        aps: ApsPayload;
        /**
         * Specifies the custom key-value pairs of the message's payload
         */
        data?: object;
    }

    // See: https://developer.apple.com/library/archive/documentation/NetworkingInternet/Conceptual/RemoteNotificationsPG/PayloadKeyReference.html
    interface ApsPayload {
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
         * Include this key with a value of 1 to configure a background update notification.
         * When this key is present, the system wakes up your app in the background and delivers the notification to its app delegate.
         */
        'content-available'?: string;
        /**
         * Provide this key with a string value that represents the notification’s type. This value corresponds to the
         * value in the identifier property of one of your app’s registered categories.
         */
        category?: string;
        /**
         * Provide this key with a string value that represents the app-specific identifier for grouping notifications.
         * If you provide a Notification Content app extension, you can use this value to group your notifications together.
         */
        'thread-id'?: string;
    }

    interface AlertPayload {
        /**
         * A short string describing the purpose of the notification. Apple Watch displays this string as part of the notification interface.
         * This string is displayed only briefly and should be crafted so that it can be understood quickly. This key was added in iOS 8.2.
         */
        title: string;
        /**
         * The text of the alert message
         */
        body: string;
        /**
         * The key to a title string in the Localizable.strings file for the current localization.
         * The key string can be formatted with %@ and %n$@ specifiers to take the variables specified in the title-loc-args array.
         */
        'title-loc-key'?: string;
        /**
         * Variable string values to appear in place of the format specifiers in title-loc-key.
         */
        'title-loc-args'?: string[] | null;
        /**
         * If a string is specified, the system displays an alert that includes the Close and View buttons.
         * The string is used as a key to get a localized string in the current localization to use for the right button’s title instead of “View”.
         */
        'action-loc-key'?: string | null;
        /**
         * A key to an alert-message string in a Localizable.strings file for the current localization (which is set by the user’s language preference).
         * The key string can be formatted with %@ and %n$@ specifiers to take the variables specified in the loc-args array.
         */
        'loc-key'?: string;
        /**
         * Variable string values to appear in place of the format specifiers in loc-key.
         */
        'loc-args'?: string[];
        /**
         * The filename of an image file in the app bundle, with or without the filename extension.
         * The image is used as the launch image when users tap the action button or move the action slider.
         * If this property is not specified, the system either uses the previous snapshot,
         * uses the image identified by the UILaunchImageFile key in the app’s Info.plist file, or falls back to Default.png.
         */
        'launch-image'?: string;
    }

    interface WebPayload {
        /**
         * The number of seconds the web push gateway should store the notification for whilst the user is offline.
         * Max: 2419200; Default: 4 weeks.
         */
        time_to_live?: number;
        /**
         * Specifies the predefined, user-visible key-value pairs of the notification payload
         */
        notification?: WebNotificationPayload;
        /**
         * Specifies the custom key-value pairs of the message's payload
         */
        data?: object;
    }

    interface WebNotificationPayload {
        /**
         * The title shown when the notification is displayed to the user.
         */
        title?: string;
        /**
         * The body shown when the notification is displayed to the user.
         */
        body?: string;
        /**
         * URL of the image shown as the notification icon when the notification is displayed.
         */
        icon?: string;
        /**
         * If provided, this URL will be opened in a new tab when the notification is clicked.
         */
        deep_link?: string;
        /**
         * If set to true, the notification will not be shown if your site has focus.
         * Default: false.
         */
        hide_notification_if_site_has_focus?: string;
    }

    interface PublishResponse {
        /**
         * Unique string used to identify this publish request
         */
        publishId: string;
    }

    type Token = string;
}

declare class PushNotifications {
    constructor(options: PushNotifications.Options);
    /**
     * Generate a Pusher Beams auth token.
     * @param userId The given user id for which to generate a Pusher Beams auth token.
     * @returns a Pusher Beams auth token
     */
    generateToken(userId: string): PushNotifications.Token;

    /**
     * Publish a notification to device interest(s).
     * @param interests Array of interests to send the push notification to, ranging from 1 to 100 per publish request.
     * @param publishRequest
     */
    publishToInterests<T extends PushNotifications.PublishRequest>(
        interests: string[],
        publishRequest: PushNotifications.PublishRequest
    ): Promise<PushNotifications.PublishResponse>;

    /**
     * Publish a notification to an authenticated user.
     * @param users Array of user ids to send the push notification to, ranging from 1 to 1000 per publish request.
     * @param publishRequest
     */
    publishToUsers<T extends PushNotifications.PublishRequest>(
        users: string[],
        publishRequest: PushNotifications.PublishRequest
    ): Promise<PushNotifications.PublishResponse>;

    /**
     * Delete a user from the Pusher Beams system, and all their associated devices.
     * @param userId The given user id to delete from the Pusher Beams service.
     */
    deleteUser(userId: string): Promise<void>;

    /**
     * Publish a notification to device interest(s)
     * @deprecated Use `publishToInterests` instead.
     * @param interests Array of interests to send the push notification to, ranging from 1 to 100 per publish request.
     * @param publishRequest
     */
    publish<T extends PushNotifications.PublishRequest>(
        interests: string[],
        publishRequest: T
    ): Promise<PushNotifications.PublishResponse>;
}

export = PushNotifications;
