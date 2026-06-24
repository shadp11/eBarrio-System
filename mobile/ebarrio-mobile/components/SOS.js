import {
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  TextInput,
  Animated,
} from "react-native";
import { MyStyles } from "./stylesheet/MyStyles";
import { useContext, useState, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import * as Location from "expo-location";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import Fire from "../assets/SOS/firefire.png";
import Flood from "../assets/SOS/flood.png";
import Earthquake from "../assets/SOS/earthquake.png";
import Typhoon from "../assets/SOS/typhoon.png";
import Medical from "../assets/SOS/medical.png";
import Suspicious from "../assets/SOS/suspicious.png";
import api from "../api";
import { useRef } from "react";
import Svg, { Circle } from "react-native-svg";
import { RFPercentage } from "react-native-responsive-fontsize";

const CIRCLE_SIZE = 280; // match button size
const STROKE_WIDTH = 6;
const RADIUS = (CIRCLE_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const SOS = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const timerRef = useRef(null);
  const borderAnim = useRef(new Animated.Value(0)).current;
  const [reportdetails, setReportdetails] = useState("");
  const [reporttype, setReporttype] = useState("");
  const [loading, setLoading] = useState(false);

  const emergencyTypes = [
    { source: Fire, label: "Fire" },
    { source: Flood, label: "Flood" },
    { source: Earthquake, label: "Earthquake" },
    { source: Typhoon, label: "Typhoon" },
    { source: Medical, label: "Medical" },
    { source: Suspicious, label: "Suspicious" },
  ];

  const sendSOS = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.warn("Location permission not granted");
      }
      let loc = await Location.getCurrentPositionAsync({});
      try {
        await api.post("/sendsos", {
          location: {
            lat: loc.coords.latitude,
            lng: loc.coords.longitude,
          },
        });
        navigation.navigate("SOSStatusPage");
      } catch (error) {
        console.error("Error sending SOS:", error);
      }
    } catch (e) {
      console.error("Error getting location:", error);
    }
  };

  const sendSOSWithDetails = async () => {
    if (loading) return;
    setLoading(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.warn("Location permission not granted");
      }
      let loc = await Location.getCurrentPositionAsync({});
      try {
        await api.post("/sendsoswithdetails", {
          location: {
            lat: loc.coords.latitude,
            lng: loc.coords.longitude,
          },
          reporttype,
          reportdetails,
        });
        navigation.navigate("SOSStatusPage");
      } catch (error) {
        console.error("Error sending SOS:", error);
      }
    } catch (e) {
      console.error("Error getting location:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePressIn = () => {
    Animated.timing(borderAnim, {
      toValue: 1,
      duration: 3000, // 5 seconds
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) {
        sendSOS();
      }
    });
  };

  const handlePressOut = () => {
    Animated.timing(borderAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

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
            { backgroundColor: "#BC0F0F" },
          ]}
        >
          <MaterialIcons
            onPress={() => navigation.navigate("BottomTabs")}
            name="arrow-back-ios"
            size={30}
            color="#fff"
          />
          <Text
            style={[
              MyStyles.header,
              MyStyles.readinessHeader,
              { fontSize: RFPercentage(3.5) },
            ]}
          >
            Emergency
          </Text>
          <Text
            style={[
              MyStyles.header,
              {
                color: "#fff",
                textAlign: "justify",
                fontFamily: "QuicksandSemiBold",
                marginTop: 10,
                fontSize: 16,
                opacity: 0.8,
              },
            ]}
          >
            Warning: Press the{" "}
            <Text style={{ fontWeight: "bold", fontSize: 18 }}>SOS</Text> button
            if you are in an emergency and need urgent assistance. Hence, please
            fill out the form first so that we can assist you better and provide
            help based on your needs.
          </Text>

          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
                position: "relative",
                width: CIRCLE_SIZE,
                height: CIRCLE_SIZE,
                marginBottom: 30,
              }}
            >
              <Svg
                width={CIRCLE_SIZE}
                height={CIRCLE_SIZE}
                style={{ position: "absolute", top: 0, left: 0 }}
              >
                <AnimatedCircle
                  cx={CIRCLE_SIZE / 2}
                  cy={CIRCLE_SIZE / 2}
                  r={RADIUS}
                  stroke="#0E94D3"
                  strokeWidth={STROKE_WIDTH}
                  strokeDasharray={CIRCUMFERENCE}
                  strokeDashoffset={borderAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [CIRCUMFERENCE, 0],
                  })}
                  strokeLinecap="round"
                  fill="none"
                />
              </Svg>

              <TouchableOpacity
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                style={{
                  width: 280,
                  height: 280,
                  borderRadius: 140,
                  backgroundColor: "#fff",
                  justifyContent: "center",
                  alignItems: "center",
                  marginTop: 50,
                }}
              >
                <Text
                  style={{
                    color: "#BC0F0F",
                    fontFamily: "REMBold",
                    fontSize: 70,
                    textAlign: "center",
                  }}
                >
                  SOS
                </Text>
              </TouchableOpacity>

              <Text
                style={[
                  MyStyles.header,
                  {
                    color: "#fff",
                    textAlign: "center",
                    fontFamily: "QuicksandSemiBold",
                    fontSize: 14,
                    opacity: 0.8,
                    marginTop:10
                  },
                ]}
              >
                Press on hold for 3 seconds to activate
              </Text>
            </View>

            <Text
              style={[
                MyStyles.header,
                {
                  color: "#fff",
                  marginTop: 50,
                  textAlign: "center",
                  fontSize: 24,
                },
              ]}
            >
              What kind of emergency?
            </Text>

            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                justifyContent: "center",
                gap: 30,
                marginTop: 20,
              }}
            >
              {emergencyTypes.map(({ source, label }, index) => {
                const isSelected = reporttype === label;
                return (
                  <TouchableOpacity
                    key={index}
                    onPress={() => setReporttype(label)}
                    style={{
                      flexDirection: "column",
                      alignItems: "center",
                      marginHorizontal: 20,
                    }}
                  >
                    <Image
                      source={source}
                      style={{
                        width: 80,
                        height: 80,
                        borderRadius: 15,
                        borderWidth: isSelected ? 4 : 0,
                        borderColor: isSelected ? "#fff" : "transparent",
                        opacity: isSelected ? 1 : 0.7,
                      }}
                    />
                    <Text
                      style={{
                        color: isSelected ? "#FFD700" : "#fff", // highlight text if selected
                        fontSize: 18,
                        fontFamily: "REMBold",
                        marginTop: 5,
                      }}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Details */}
            <View style={{ marginTop: 40, width: "100%" }}>
              <Text
                style={{
                  color: "#fff",
                  fontSize: 18,
                  fontFamily: "QuicksandBold",
                }}
              >
                Details of the Emergency
              </Text>
              <TextInput
                value={reportdetails}
                onChangeText={setReportdetails}
                placeholder="Enter details"
                style={[
                  MyStyles.input,
                  { height: 150, textAlignVertical: "top" },
                ]}
                multiline={true}
                numberOfLines={4}
                maxLength={3000}
              />
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "flex-end",
                  width: "100%",
                }}
              >
                <Text
                  style={{
                    color: "#fff",
                    fontFamily: "QuicksandSemiBold",
                    opacity: 0.8,
                  }}
                >
                  /3000
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={sendSOSWithDetails}
              disabled={loading}
              style={[
                MyStyles.button,
                { backgroundColor: "#fff", marginTop: 20 },
              ]}
            >
              <Text style={[MyStyles.buttonText, { color: "#BC0F0F" }]}>
                {loading ? "SUBMITTING..." : "ASK HELP"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SOS;
