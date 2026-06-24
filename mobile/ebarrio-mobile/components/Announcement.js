import {
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
} from "react-native";
import { MyStyles } from "./stylesheet/MyStyles";
import { useContext, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from "../context/AuthContext";
import { useEffect } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { InfoContext } from "../context/InfoContext";
import api from "../api";
import { Dropdown } from "react-native-element-dropdown";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import ImageViewing from "react-native-image-viewing";

//ICONS
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Entypo from "@expo/vector-icons/Entypo";
import Aniban2Logo from "../assets/aniban2logo.png";

const Announcement = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { fetchAnnouncements, announcements } = useContext(InfoContext);
  const { user } = useContext(AuthContext);
  const [sortOption, setSortOption] = useState("newest");
  dayjs.extend(relativeTime);
  const [expandedAnnouncements, setExpandedAnnouncements] = useState([]);

  const [visible, setIsVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleHeart = async (announcementID) => {
    try {
      await api.put(`/heartannouncement/${announcementID}`);
    } catch (error) {
      console.log("Error liking announcement", error);
    }
  };

  const handleUnheart = async (announcementID) => {
    try {
      await api.put(`/unheartannouncement/${announcementID}`);
    } catch (error) {
      console.log("Error liking announcement", error);
    }
  };

  /* EXPANDED ANNOUNCEMENTS */
  const toggleExpanded = (id) => {
    setExpandedAnnouncements((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const sortedAnnouncements = [...announcements].sort((a, b) => {
    const aPinned = a.status === "Pinned";
    const bPinned = b.status === "Pinned";
    if (aPinned && !bPinned) return -1;
    if (!aPinned && bPinned) return 1;
    if (sortOption === "newest") {
      return new Date(b.createdAt) - new Date(a.createdAt);
    } else {
      return new Date(a.createdAt) - new Date(b.createdAt);
    }
  });

  const renderContent = (announcement) => {
    const words = announcement.content.split(" ");
    const isLong = words.length > 50;
    const isExpanded = expandedAnnouncements.includes(announcement._id);
    const displayText = isExpanded
      ? announcement.content
      : words.slice(0, 50).join(" ") + (isLong ? "..." : "");

    return (
      <View style={{ marginVertical: 10 }}>
        {announcement.eventdetails !== "" && (
          <Text style={MyStyles.eventDateTime}>
            {announcement.eventdetails}
          </Text>
        )}
        <Text style={MyStyles.eventText}>{displayText}</Text>
        {isLong && (
          <Text
            style={MyStyles.seeMoreText}
            onPress={() => toggleExpanded(announcement._id)}
          >
            {isExpanded ? "See less" : "See more"}
          </Text>
        )}
      </View>
    );
  };

  return (
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
            MyStyles.burgerWrapper,
            { paddingHorizontal: 20, paddingVertical: 10 },
          ]}
        >
          <Entypo
            name="menu"
            color="#0E94D3"
            onPress={() => navigation.openDrawer()}
            style={MyStyles.burgerChatIcon}
          />
          <View>
            <Text style={MyStyles.header}>Announcements</Text>
          </View>
        </View>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            MyStyles.scrollContainer,
            {
              paddingBottom: insets.bottom + 100,
              gap: 10,
              padding: 25,
            },
          ]}
        >
          <Dropdown
            data={[
              { label: "Newest", value: "newest" },
              { label: "Oldest", value: "oldest" },
            ]}
            labelField="label"
            valueField="value"
            value={sortOption}
            placeholder={sortOption}
            onChange={(item) => setSortOption(item.value)}
            style={[MyStyles.dropdownWrapper, { marginTop: 0 }]}
            selectedTextStyle={MyStyles.dropdownText}
          />
          {sortedAnnouncements.map((element, index) => (
            <View key={index} style={MyStyles.announcementCard}>
              <View style={MyStyles.rowAlignment}>
                <View style={MyStyles.rowAlignment}>
                  <Image
                    source={Aniban2Logo}
                    style={MyStyles.announcementLogo}
                  />
                  <View style={MyStyles.announcementHeaderWrapper}>
                    <Text style={MyStyles.announcementUploader}>
                      Barangay Aniban 2
                    </Text>
                    <Text style={MyStyles.announcementCreatedAt}>
                      {dayjs(element.createdAt).fromNow()}
                    </Text>
                  </View>
                </View>

                {element.status === "Pinned" && (
                  <MaterialIcons
                    name="push-pin"
                    color="#04384E"
                    style={MyStyles.pin}
                  />
                )}
              </View>

              <View style={{ marginVertical: 10 }}>
                <View>
                  <Text style={MyStyles.announcementCategory}>
                    {element.category}
                  </Text>
                </View>
                <View>
                  <Text style={MyStyles.announcementTitle}>
                    {element.title}
                  </Text>
                </View>
              </View>

              {element.picture && element.picture.trim() !== "" && (
                <TouchableOpacity
                  onPress={() => {
                    setSelectedImage([{ uri: element.picture }]);
                    setIsVisible(true);
                  }}
                >
                  <Image
                    source={{ uri: element.picture }}
                    style={MyStyles.announcementImg}
                  />
                </TouchableOpacity>
              )}

              <ImageViewing
                images={selectedImage || []}
                imageIndex={0}
                visible={visible}
                onRequestClose={() => setIsVisible(false)}
                presentationStyle="overFullScreen"
              />

              {renderContent(element)}

              <View style={MyStyles.heartWrapper}>
                {Array.isArray(element.heartedby) &&
                element.heartedby.includes(user.userID) ? (
                  <TouchableOpacity onPress={() => handleUnheart(element._id)}>
                    <Ionicons name="heart" size={24} color="red" />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity onPress={() => handleHeart(element._id)}>
                    <Ionicons name="heart-outline" size={24} color="#808080" />
                  </TouchableOpacity>
                )}
                <Text style={MyStyles.textMedium}>{element.hearts}</Text>
              </View>
            </View>
          ))}
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
  );
};
export default Announcement;
