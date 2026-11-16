/**
 * Partner app location service — Driver background location tracking.
 */
import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import { partnerApi } from "./api";
import { partnerAuth } from "./auth";

const LOCATION_TASK = "kullo-partner-location";

let isTracking = false;

TaskManager.defineTask(LOCATION_TASK, async ({ data, error }) => {
  if (error) {
    console.error("Location task error:", error);
    return;
  }
  if (data) {
    const { locations } = data as { locations: Location.LocationObject[] };
    const loc = locations[0];
    if (loc) {
      const user = await partnerAuth.getUser();
      if (user) {
        await partnerApi.updateDriverLocation(
          user.id,
          loc.coords.latitude,
          loc.coords.longitude,
          true,
        );
      }
    }
  }
});

export const locationService = {
  async requestPermissions(): Promise<boolean> {
    const { status: foreground } = await Location.requestForegroundPermissionsAsync();
    if (foreground !== "granted") return false;

    const { status: background } = await Location.requestBackgroundPermissionsAsync();
    return background === "granted";
  },

  async hasPermissions(): Promise<boolean> {
    const fg = await Location.getForegroundPermissionsAsync();
    const bg = await Location.getBackgroundPermissionsAsync();
    return fg.granted && bg.granted;
  },

  async getCurrentLocation(): Promise<Location.LocationObject | null> {
    try {
      const hasPerms = await this.hasPermissions();
      if (!hasPerms) {
        const granted = await this.requestPermissions();
        if (!granted) return null;
      }
      return await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
    } catch {
      return null;
    }
  },

  async startTracking(): Promise<boolean> {
    if (isTracking) return true;

    const hasPerms = await this.hasPermissions();
    if (!hasPerms) {
      const granted = await this.requestPermissions();
      if (!granted) return false;
    }

    try {
      await Location.startLocationUpdatesAsync(LOCATION_TASK, {
        accuracy: Location.Accuracy.High,
        distanceInterval: 50,
        timeInterval: 10000,
        showsBackgroundLocationIndicator: true,
        foregroundService: {
          notificationTitle: "Kullo Partner",
          notificationBody: "Konum paylaşılıyor",
          notificationColor: "#F36A1C",
        },
      });
      isTracking = true;
      return true;
    } catch (e) {
      console.error("Failed to start location tracking:", e);
      return false;
    }
  },

  async stopTracking(): Promise<void> {
    if (!isTracking) return;

    try {
      const user = await partnerAuth.getUser();
      if (user) {
        const loc = await this.getCurrentLocation();
        if (loc) {
          await partnerApi.updateDriverLocation(
            user.id,
            loc.coords.latitude,
            loc.coords.longitude,
            false,
          );
        }
      }
      await Location.stopLocationUpdatesAsync(LOCATION_TASK);
      isTracking = false;
    } catch (e) {
      console.error("Failed to stop location tracking:", e);
    }
  },

  async isTracking(): Promise<boolean> {
    try {
      return await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK);
    } catch {
      return false;
    }
  },

  async sendCurrentLocation(online: boolean): Promise<boolean> {
    const user = await partnerAuth.getUser();
    if (!user) return false;

    const loc = await this.getCurrentLocation();
    if (!loc) return false;

    const result = await partnerApi.updateDriverLocation(
      user.id,
      loc.coords.latitude,
      loc.coords.longitude,
      online,
    );
    return result.ok;
  },
};
