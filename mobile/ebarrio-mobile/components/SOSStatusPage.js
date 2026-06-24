import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  Dimensions,
  Image,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { MyStyles } from "./stylesheet/MyStyles";
import { useState, useEffect, useRef, useContext } from "react";
import { useNavigation } from "@react-navigation/native";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import LottieView from "lottie-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { InfoContext } from "../context/InfoContext";
import { PanResponder } from "react-native";
import api from "../api";
import AlertModal from "./AlertModal";
import { RFPercentage } from "react-native-responsive-fontsize";

const SOSStatusPage = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { report } = useContext(InfoContext);
  const [alertMessage, setAlertMessage] = useState("");
  const [isAlertModalVisible, setIsAlertModalVisible] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const reportRef = useRef(report);

  useEffect(() => {
    reportRef.current = report;
  }, [report]);

  const hasArrivedResponder = report?.responder?.some(
    (r) => r.status === "Arrived"
  );

  const { width } = Dimensions.get("window");
  const SLIDER_WIDTH = width * 0.8;
  const SLIDER_HEIGHT = 60;
  const CIRCLE_SIZE = 50;
  const SLIDE_THRESHOLD = SLIDER_WIDTH - CIRCLE_SIZE - 10;

  const panX = useRef(new Animated.Value(0)).current;
  const [cancelled, setCancelled] = useState(false);
  const [isSliding, setIsSliding] = useState(false);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        setIsSliding(true);
        const newX = Math.min(
          Math.max(gesture.dx, 0),
          SLIDER_WIDTH - CIRCLE_SIZE
        );
        panX.setValue(newX);
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > SLIDE_THRESHOLD) {
          cancelSOS();
          Animated.spring(panX, {
            toValue: SLIDER_WIDTH - CIRCLE_SIZE - 5,
            useNativeDriver: false,
          }).start();
        } else {
          Animated.spring(panX, {
            toValue: 0,
            useNativeDriver: false,
          }).start();
        }
        setIsSliding(false);
      },
    })
  ).current;
  const cancelSOS = async () => {
    if (!reportRef.current?._id) {
      setAlertMessage("Report not loaded yet.");
      setIsAlertModalVisible(true);
      return;
    }
    try {
      await api.put(`/cancelsos/${reportRef.current._id}`);
      setIsSuccess(true);
      setAlertMessage("Your report has been cancelled successfully.");
    } catch (error) {
      const response = error.response;
      if (response && response.data) {
        console.log("❌ Error status:", response.status);
        setAlertMessage(response.data.message || "Something went wrong.");
        setIsAlertModalVisible(true);
        setAlertVisible(false);
      } else {
        console.log("❌ Network or unknown error:", error.message);
        setAlertMessage("An unexpected error occurred.");
        setIsAlertModalVisible(true);
        setAlertVisible(false);
      }
    } finally {
      setIsAlertModalVisible(true);
      setAlertMessage(message);
      setIsSuccess(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
      alignItems: "center",
      justifyContent: "center",
      marginVertical: 30,
    },
    slider: {
      width: SLIDER_WIDTH,
      height: SLIDER_HEIGHT,
      backgroundColor: "#a11",
      borderRadius: SLIDER_HEIGHT / 2,
      justifyContent: "center",
      paddingLeft: CIRCLE_SIZE / 2,
    },
    text: {
      position: "absolute",
      left: CIRCLE_SIZE + 20,
      color: "white",
      fontWeight: "bold",
      fontSize: RFPercentage(2),
    },
    circle: {
      position: "absolute",
      left: 5,
      width: CIRCLE_SIZE,
      height: CIRCLE_SIZE,
      borderRadius: CIRCLE_SIZE / 2,
      backgroundColor: "#fff",
      justifyContent: "center",
      alignItems: "center",
    },
    cross: {
      fontSize: RFPercentage(2.4),
      color: "#a11",
      fontWeight: "bold",
    },
    done: {
      marginTop: 20,
      color: "white",
      fontSize: RFPercentage(2),
    },
  });

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
          <AntDesign
            onPress={() => navigation.navigate("BottomTabs")}
            name="arrowleft"
            style={[MyStyles.backArrow, { color: "#fff" }]}
          />

          {/* Display "Help has arrived" or "Help is on the way" */}

          {report &&
            (hasArrivedResponder ? (
              <>
                <Text
                  style={[
                    MyStyles.header,
                    {
                      marginTop: 20,
                      textAlign: "start",
                      color: "#fff",
                    },
                  ]}
                >
                  Help has arrived
                </Text>
                {/* Render responders */}
                {report.responder
                  .filter((r) => r.status === "Arrived")
                  .map((r) => {
                    return (
                      <View
                        key={r.empID._id}
                        style={{ marginVertical: 30, alignItems: "center" }}
                      >
                        <Image
                          source={{
                            uri: r.empID.resID.picture,
                          }}
                          style={{
                            width: 180,
                            height: 180,
                            borderRadius: 90,
                            backgroundColor: "white",
                          }}
                        />
                        <Text style={MyStyles.sosResponderName}>
                          {r.empID.resID.firstname} {r.empID.resID.lastname}
                        </Text>
                        <Text style={MyStyles.sosResponderPosition}>
                          {r.empID.position}
                        </Text>
                        {/* Responders' time and mobile number */}
                        <View
                          style={[
                            MyStyles.sosCard,
                            { flexDirection: "column", gap: 20, padding: 30 },
                          ]}
                        >
                          <View
                            style={[MyStyles.sosDetailsRowWrapper, { gap: 10 }]}
                          >
                            <Ionicons
                              name="time"
                              style={[MyStyles.sosHelpHasArriveIcon]}
                            />
                            <Text
                              style={[
                                MyStyles.sosHelpHasArriveDetails,
                                { fontFamily: "QuicksandBold" },
                              ]}
                            >
                              Time:
                            </Text>
                            <Text style={MyStyles.sosHelpHasArriveDetails}>
                              {r.arrivedat
                                ? new Date(r.arrivedat).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })
                                : "N/A"}
                            </Text>
                          </View>

                          <View
                            style={[MyStyles.sosDetailsRowWrapper, { gap: 10 }]}
                          >
                            <Ionicons
                              name="call"
                              style={[MyStyles.sosHelpHasArriveIcon]}
                            />
                            <Text
                              style={[
                                MyStyles.sosHelpHasArriveDetails,
                                { fontFamily: "QuicksandBold" },
                              ]}
                            >
                              Mobile:
                            </Text>
                            <Text style={MyStyles.sosHelpHasArriveDetails}>
                              {r.empID.resID.mobilenumber}
                            </Text>
                          </View>
                        </View>
                      </View>
                    );
                  })}
              </>
            ) : (
              <>
                <Text
                  style={[
                    MyStyles.header,
                    {
                      marginTop: 20,
                      textAlign: "center",
                      color: "#fff",
                      fontSize: RFPercentage(3.5),
                    },
                  ]}
                >
                  Help is on the way
                </Text>
                <View
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <LottieView
                    source={require("../assets/sos-on-the-way.json")}
                    autoPlay
                    loop
                    style={{
                      width: 350,
                      height: 350,
                    }}
                  />
                  <Text
                    style={{
                      fontFamily: "QuicksandBold",
                      marginTop: 20,
                      textAlign: "center",
                      color: "#fff",
                      opacity: 0.8,
                      fontSize: RFPercentage(2),
                      padding: 20,
                    }}
                  >
                    Your help is on the way. {"\n"} In the meantime, please
                    remain calm and know that assistance is coming soon.
                  </Text>
                </View>
              </>
            ))}

          {report && (!report?.responder || report.responder.length === 0) && (
            <View style={styles.container}>
              <View style={[styles.slider, { paddingLeft: CIRCLE_SIZE / 2 }]}>
                {!isSliding && !cancelled && (
                  <Text style={styles.text}>slide to cancel</Text>
                )}
                <Animated.View
                  {...panResponder.panHandlers}
                  style={[
                    styles.circle,
                    {
                      transform: [{ translateX: panX }],
                    },
                  ]}
                >
                  <Text style={styles.cross}>✕</Text>
                </Animated.View>
              </View>
            </View>
          )}
        </ScrollView>
        <AlertModal
          isVisible={isAlertModalVisible}
          message={alertMessage}
          onConfirm={() => {
            setIsAlertModalVisible(false);
            navigation.navigate("BottomTabs");
          }}
          isSuccess={isSuccess}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SOSStatusPage;
