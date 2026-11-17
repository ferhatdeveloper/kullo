/**
 * Partner app push notifications — Order alerts, ride requests.
 */
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export type NotificationType = "new_order" | "new_ride" | "order_update" | "ride_update";

export interface PartnerNotification {
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

export const notificationService = {
  async registerForPushNotifications(): Promise<string | null> {
    if (!Device.isDevice) {
      console.log("Push notifications require a physical device");
      return null;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.log("Push notification permission not granted");
      return null;
    }

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("partner_orders", {
        name: "Siparişler",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#F36A1C",
        sound: "default",
      });

      await Notifications.setNotificationChannelAsync("partner_rides", {
        name: "Seferler",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#F36A1C",
        sound: "default",
      });
    }

    try {
      const token = await Notifications.getExpoPushTokenAsync({
        projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
      });
      return token.data;
    } catch (e) {
      console.error("Failed to get push token:", e);
      return null;
    }
  },

  async scheduleLocalNotification(notification: PartnerNotification): Promise<string> {
    const channelId =
      notification.type === "new_order" || notification.type === "order_update"
        ? "partner_orders"
        : "partner_rides";

    return await Notifications.scheduleNotificationAsync({
      content: {
        title: notification.title,
        body: notification.body,
        data: notification.data,
        sound: true,
      },
      trigger: null,
      ...(Platform.OS === "android" ? { channelId } : {}),
    });
  },

  addNotificationListener(
    callback: (notification: Notifications.Notification) => void,
  ): Notifications.Subscription {
    return Notifications.addNotificationReceivedListener(callback);
  },

  addResponseListener(
    callback: (response: Notifications.NotificationResponse) => void,
  ): Notifications.Subscription {
    return Notifications.addNotificationResponseReceivedListener(callback);
  },

  async clearBadge(): Promise<void> {
    await Notifications.setBadgeCountAsync(0);
  },

  async setBadge(count: number): Promise<void> {
    await Notifications.setBadgeCountAsync(count);
  },
};
