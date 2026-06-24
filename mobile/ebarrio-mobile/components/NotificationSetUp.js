import React, { useEffect, useState, useRef } from "react";
import { Alert, Platform } from "react-native";
import * as Notifications from "expo-notifications";
import api from "../api";

export default function NotificationSetup() {
  const [expoPushToken, setExpoPushToken] = useState("");

  useEffect(() => {
    registerForPushNotificationsAsync()
      .then(async (token) => {
        setExpoPushToken(token);

        try {
          await api.put("/setpushtoken", { token });
        } catch (error) {
          const response = error.response;
          if (response && response.data) {
            console.log(response.data.message || "Something went wrong.");
          } else {
            console.log("❌ Network or unknown error:", error.message);
          }
        }
      })
      .catch((err) => {
        console.log("Error getting push token:", err);
        Alert.alert("Failed to get push token", err.message || "Unknown error");
      });
  }, []);

  async function registerForPushNotificationsAsync() {
    let { status } = await Notifications.getPermissionsAsync();

    if (status !== "granted") {
      const { status: newStatus } =
        await Notifications.requestPermissionsAsync();
      status = newStatus;
    }

    const isGranted = status === "granted";

    if (!isGranted) {
      Alert.alert("Permission not granted for notifications!");
      return;
    }

    const token = (await Notifications.getExpoPushTokenAsync()).data;
    return token;
  }

  return null; // or your app UI
}
