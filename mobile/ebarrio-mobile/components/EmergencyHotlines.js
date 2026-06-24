import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Linking,
  ActivityIndicator,
} from "react-native";
import { useContext, useState, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { InfoContext } from "../context/InfoContext";
import { AuthContext } from "../context/AuthContext";
import api from "../api";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MyStyles } from "./stylesheet/MyStyles";
import { RFPercentage } from "react-native-responsive-fontsize";

//ICONS
import { AntDesign, MaterialIcons } from "@expo/vector-icons";

const EmergencyHotlines = () => {
  const insets = useSafeAreaInsets();
  const { fetchEmergencyHotlines, emergencyhotlines } = useContext(InfoContext);
  const [filteredEmergencyHotlines, setFilteredEmergencyHotlines] = useState(
    []
  );
  const [search, setSearch] = useState("");
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchEmergencyHotlines();
      setLoading(false);
    };

    loadData();
  }, []);

  const handleCall = async (contactNumber) => {
    const phoneNumber = `tel:${contactNumber}`;
    Linking.openURL(phoneNumber).catch((err) =>
      console.error("Error opening dialer: ", err)
    );
  };

  const handleSearch = (text) => {
    const sanitizedText = text.replace(/[^a-zA-Z\s.]/g, "");
    const formattedText = sanitizedText
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");

    setSearch(formattedText);
  };

  useEffect(() => {
    if (search) {
      const filtered = emergencyhotlines.filter((emergency) => {
        return emergency.name.includes(search);
      });
      setFilteredEmergencyHotlines(filtered);
    } else {
      setFilteredEmergencyHotlines(emergencyhotlines);
    }
  }, [search, emergencyhotlines]);

  return (
    <SafeAreaView
      style={{
        flex: 1,
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        backgroundColor: "#BC0F0F",
      }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={[
            MyStyles.scrollContainer,
            {
              backgroundColor: "#BC0F0F",
              gap: 10,
            },
          ]}
        >
          <AntDesign
            onPress={() => navigation.navigate("BottomTabs")}
            name="arrowleft"
            style={[MyStyles.backArrow, { color: "#fff" }]}
          />

          <Text
            style={[MyStyles.servicesHeader, { marginTop: 0, color: "#fff" }]}
          >
            Hotlines
          </Text>

          <View style={{ gap: 15 }}>
            <View style={{ position: "relative" }}>
              <TextInput
                value={search}
                onChangeText={handleSearch}
                style={[MyStyles.input, { paddingLeft: 40, height: 45 }]}
                placeholder="Search..."
              />
              <MaterialIcons
                name="search"
                size={20}
                color="#808080"
                style={MyStyles.searchIcon}
              />
            </View>
            <Text
              style={[MyStyles.formMessage, { color: "#fff", opacity: 0.8 }]}
            >
              Tapping a hotline number will instantly open your phone’s dialer
              to make the call.
            </Text>

            {loading ? (
              <View style={{ paddingVertical: 30, alignItems: "center" }}>
                <ActivityIndicator size="large" color="#04384E" />
              </View>
            ) : filteredEmergencyHotlines.filter((e) => e.status !== "Archived")
                .length === 0 ? (
              <Text style={[MyStyles.noEvents, { color: "#fff" }]}>
                No hotlines found.
              </Text>
            ) : (
              filteredEmergencyHotlines
                .filter((element) => element.status !== "Archived")
                .map((element) => (
                  <TouchableOpacity
                    key={element._id}
                    onPress={() => handleCall(element.contactnumber)}
                    style={[
                      MyStyles.input,
                      {
                        flexDirection: "row",
                        alignItems: "center",
                        height: RFPercentage(7),
                        padding: 15,
                      },
                    ]}
                  >
                    <MaterialIcons
                      name="call"
                      color="#BC0F0F"
                      style={{
                        marginRight: 10,
                        fontSize: RFPercentage(3),
                      }}
                    />
                    <View style={{ marginLeft: 10 }}>
                      <Text
                        style={{
                          color: "#04384E",
                          fontFamily: "REMSemiBold",
                          fontSize: RFPercentage(2),
                        }}
                      >
                        {element.name.toUpperCase()}
                      </Text>
                      <Text
                        style={{
                          color: "#04384E",
                          fontFamily: "QuicksandSemiBold",
                          fontSize: RFPercentage(2),
                        }}
                      >
                        {element.contactnumber}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default EmergencyHotlines;
