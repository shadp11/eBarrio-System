import {
  MyStylesheet,
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { MyStyles } from "./stylesheet/MyStyles";
import { useContext, useEffect } from "react";
import { SocketContext } from "../context/SocketContext";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import api from "../api";
import Octicons from "@expo/vector-icons/Octicons";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import Entypo from "@expo/vector-icons/Entypo";
import { InfoContext } from "../context/InfoContext";
import { AuthContext } from "../context/AuthContext";

const Notification = () => {
  const navigation = useNavigation();
  dayjs.extend(relativeTime);
  const insets = useSafeAreaInsets();
  const { user } = useContext(AuthContext);
  const { notifications, fetchNotifications } = useContext(InfoContext);
  const [isFilterDropdownVisible, setIsFilterDropdownVisible] = useState(false);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleNotif = async (notifID, redirectTo) => {
    try {
      await api.put(`/readnotification/${notifID}`);
      navigation.navigate(redirectTo);
    } catch (error) {
      console.log("Error in reading notification", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put("/readnotifications");
    } catch (error) {
      console.log("Error in marking all as read", error);
    }
  };

  const truncateNotifMessage = (message, wordLimit = 25) => {
    const words = message.split(" ");
    return words.length > wordLimit
      ? words.slice(0, wordLimit).join(" ") + " ..."
      : message;
  };

  const filteredNotifications = notifications.filter((notif) => {
    if (filter === "All") return true;
    if (filter === "Read") return notif.read === true;
    if (filter === "Unread") return notif.read === false;
    return true;
  });

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        setIsFilterDropdownVisible(false);
        Keyboard.dismiss();
      }}
    >
      <SafeAreaView
        style={{
          flex: 1,
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
          backgroundColor: "#F0F4F7",
        }}
      >
        <View style={MyStyles.notScrollWrapper}>
          <View
            style={[
              MyStyles.rowAlignment,
              { paddingHorizontal: 20, paddingVertical: 10 },
            ]}
          >
            <View style={MyStyles.rowAlignment}>
              <Entypo
                name="menu"
                color="#0E94D3"
                onPress={() => navigation.openDrawer()}
                style={MyStyles.burgerChatIcon}
              />
              <View>
                <Text style={MyStyles.header}>Notifications</Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() =>
                setIsFilterDropdownVisible(!isFilterDropdownVisible)
              }
            >
              <Octicons name="filter" size={24} color="#0E94D3" />
            </TouchableOpacity>
          </View>
          {/* Dropdown Modal */}
          {isFilterDropdownVisible && (
            <View style={MyStyles.filterDropdown}>
              <TouchableOpacity
                onPress={() => {
                  setFilter("All");
                  setIsFilterDropdownVisible(false);
                }}
                style={MyStyles.filterDropdownItem}
              >
                <Text style={MyStyles.filterDropdownText}>All</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setFilter("Read");
                  setIsFilterDropdownVisible(false);
                }}
                style={MyStyles.filterDropdownItem}
              >
                <Text style={MyStyles.filterDropdownText}>Read</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setFilter("Unread");
                  setIsFilterDropdownVisible(false);
                }}
                style={MyStyles.filterDropdownItem}
              >
                <Text style={MyStyles.filterDropdownText}>Unread</Text>
              </TouchableOpacity>
            </View>
          )}
          <TouchableOpacity onPress={markAllAsRead}>
            <Text style={MyStyles.markAllText}>Mark all as read</Text>
          </TouchableOpacity>

          <ScrollView
            contentContainerStyle={[
              MyStyles.scrollContainer,
              {
                paddingBottom: insets.bottom + 100,
                paddingHorizontal: 25,
                marginTop: -10,
              },
            ]}
            showsVerticalScrollIndicator={false}
          >
            {filteredNotifications.length === 0 ? (
              <Text
                style={[
                  MyStyles.textMedium,
                  { textAlign: "center", marginTop: 20 },
                ]}
              >
                You're all caught up! No new notifications.
              </Text>
            ) : (
              filteredNotifications
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .map((notif, index) => {
                  return (
                    <TouchableOpacity
                      key={index}
                      onPress={() => handleNotif(notif._id, notif.redirectTo)}
                      style={MyStyles.notifLine}
                    >
                      <View style={MyStyles.notifRowSpacing}>
                        <View style={{ flexDirection: "column", flex: 1 }}>
                          <Text
                            style={[
                              MyStyles.notifTitleMessage,
                              { fontFamily: "REMSemiBold" },
                            ]}
                          >
                            {notif.title}
                          </Text>
                          <Text
                            style={[
                              MyStyles.notifTitleMessage,
                              { fontFamily: "QuicksandSemiBold" },
                            ]}
                          >
                            {truncateNotifMessage(notif.message)}
                          </Text>
                          <Text
                            style={[MyStyles.textMedium, { color: "808080" }]}
                          >
                            {dayjs(notif.createdAt).fromNow()}
                          </Text>
                        </View>
                      </View>

                      <View
                        style={[
                          MyStyles.notifCircle,
                          {
                            backgroundColor: notif.read
                              ? "transparent"
                              : "#3B82F6",
                          },
                        ]}
                      />
                    </TouchableOpacity>
                  );
                })
            )}
          </ScrollView>
        </View>
        {/* Fixed Floating Chat Button */}
        {/* <TouchableOpacity
          onPress={() => navigation.navigate("Chat")}
          style={{
            position: "absolute",
            bottom: insets.bottom + 60,
            right: 20,
            backgroundColor: "#fff",
            width: 60,
            height: 60,
            borderRadius: 30,
            elevation: 10,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 5,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View onPress={() => navigation.navigate("Chat")}>
            <Ionicons name="chatbubble-ellipses" size={30} color="#0E94D3" />
          </View>
        </TouchableOpacity> */}
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default Notification;
