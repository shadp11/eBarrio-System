import { useEffect } from "react";
import * as Location from "expo-location";

export default function LocationSetUp() {
  useEffect(() => {
    const requestPermission = async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          console.warn("Location permission not granted");
        }
      } catch (e) {
        console.error("Location error:", e);
      }
    };

    requestPermission();
  }, []);

  return null;
}
