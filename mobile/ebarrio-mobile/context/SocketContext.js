import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { AuthContext } from "./AuthContext";
import { io } from "socket.io-client";
import { Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import api from "../api";

export const SocketContext = createContext();

export const SocketProvider = ({ children, navigationRef }) => {
  const { user, isAuthenticated } = useContext(AuthContext);
  const socketRef = useRef(null); // ✅ Persistent ref

  useEffect(() => {
    if (!user?.userID || socketRef.current) return;

    const socket = io("https://api.ebarrio.online", {
      transports: ["polling", "websocket"],
      withCredentials: true,
      timeout: 60000,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);
      socket.emit("register", user.userID, user.role);
      socket.emit("join_announcements");

      if (user.role !== "Resident") {
        socket.emit("join_sos");
      }
    });

    socket.on("connect_error", (err) => {
      console.log("❌ Socket connection failed:", err.message);
      console.log(err);
    });

    socket.on("announcement", (announcement) => {
      Alert.alert(
        announcement.title,
        announcement.message,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "View Now",
            onPress: () => navigationRef.navigate("Announcements"),
          },
        ],
        { cancelable: true }
      );
    });

    socket.on("certificateUpdate", (certificate) => {
      Alert.alert(
        certificate.title,
        certificate.message,
        [
          { text: "Cancel", style: "cancel" },
          { text: "View Now", onPress: () => navigationRef.navigate("Status") },
        ],
        { cancelable: true }
      );
    });

    socket.on("blotterUpdate", (blotter) => {
      Alert.alert(
        blotter.title,
        blotter.message,
        [
          { text: "Cancel", style: "cancel" },
          { text: "View Now", onPress: () => navigationRef.navigate("Status") },
        ],
        { cancelable: true }
      );
    });

    socket.on("reservationUpdate", (res) => {
      Alert.alert(
        res.title,
        res.message,
        [
          { text: "Cancel", style: "cancel" },
          { text: "View Now", onPress: () => navigationRef.navigate("Status") },
        ],
        { cancelable: true }
      );
    });

    socket.on("chatUpdate", (res) => {
      const currentRoute = navigationRef.getCurrentRoute();

      if (currentRoute?.name === "Chat") {
        return;
      }
      Alert.alert(
        res.title,
        res.message,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "View Now",
            onPress: () =>
              navigationRef.navigate("Chat", { roomId: res.roomId }),
          },
        ],
        { cancelable: true }
      );
    });

    socket.on("sos", (s) => {
      Alert.alert(
        s.title,
        s.message,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "View Now",
            onPress: () =>
              navigationRef.navigate(s.redirectTo || "SOSRequests"),
          },
        ],
        { cancelable: true }
      );
    });

    socket.on("sosUpdate", (s) => {
      Alert.alert(
        s.title,
        s.message,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "View Now",
            onPress: () => navigationRef.navigate("SOSStatusPage"),
          },
        ],
        { cancelable: true }
      );
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user?.userID, user?.role]);

  useEffect(() => {
    if (!isAuthenticated && socketRef.current && user?.userID) {
      socketRef.current.emit("unregister", user.userID);
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  }, [isAuthenticated]);

  return (
    <SocketContext.Provider
      value={{
        socket: socketRef.current,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
