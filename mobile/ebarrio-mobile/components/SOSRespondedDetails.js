import {
  StyleSheet,
  Text,
  View,
  Alert,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  Dimensions,
} from "react-native";
import { MyStyles } from "./stylesheet/MyStyles";
import { useContext, useState, useEffect } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import { AuthContext } from "../context/AuthContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AntDesign, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { InfoContext } from "../context/InfoContext";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import MapView, { Marker } from "react-native-maps";
import api from "../api";

const SOSRespondedDetails = () => {
  dayjs.extend(relativeTime);
  const route = useRoute();
  const { selectedID } = route.params;
  const insets = useSafeAreaInsets();
  const { user } = useContext(AuthContext);
  const { fetchRespondedSOS, respondedSOS } = useContext(InfoContext);
  const navigation = useNavigation();
  const { width } = Dimensions.get("window");

  useEffect(() => {
    fetchRespondedSOS();
  }, []);

  const selectedReport = respondedSOS?.find(
    (report) => report._id === selectedID
  );

  const enrichedReport = selectedReport
    ? {
        ...selectedReport,
        ...getDateAndTime(selectedReport.createdAt),
      }
    : null;

  function getDateAndTime(timestamp) {
    if (!timestamp) return { datePart: "", timePart: "" };

    const date = new Date(timestamp);

    const datePart = date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      timeZone: "Asia/Manila",
    });

    const timePart = date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Manila",
    });

    return { datePart, timePart };
  }

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
            onPress={() => navigation.navigate("RespondedSOS")}
            name="arrowleft"
            style={[MyStyles.backArrow, { color: "white" }]}
          />

          <Text
            style={[MyStyles.header, { fontFamily: "REMBold", color: "white" }]}
          >
            Responded Details
          </Text>

          {enrichedReport && (
            <View
              key={enrichedReport._id}
              style={[MyStyles.sosCard, MyStyles.shadow]}
            >
              <View style={MyStyles.rowAlignment}>
                <View
                  style={[
                    MyStyles.statusWrapper,
                    {
                      backgroundColor:
                        selectedReport.status === "False Alarm"
                          ? "red"
                          : selectedReport.status === "Pending"
                          ? "orange"
                          : selectedReport.status === "Resolved"
                          ? "green"
                          : "gray",
                    },
                  ]}
                >
                  <Ionicons
                    name={
                      selectedReport.status === "False Alarm"
                        ? "alert-circle"
                        : selectedReport.status === "Pending"
                        ? "time"
                        : selectedReport.status === "Resolved"
                        ? "checkmark-done-circle"
                        : "help-circle"
                    }
                    style={MyStyles.statusIcon}
                  />
                  <Text style={MyStyles.statusTitle}>
                    {enrichedReport.status || "Pending"}
                  </Text>
                </View>

                <Text
                  style={[
                    MyStyles.sosDetailsText,
                    { textAlign: "right", flex: 1, color: "gray" },
                  ]}
                >
                  {dayjs(enrichedReport.updatedAt).fromNow()}
                </Text>
              </View>

              <View
                style={[
                  MyStyles.rowAlignment,
                  { justifyContent: "flex-start" },
                ]}
              >
                <View>
                  <Image
                    source={{
                      uri:
                        enrichedReport?.resID?.picture ||
                        "https://via.placeholder.com/80",
                    }}
                    style={MyStyles.sosImg}
                  />
                </View>
                <View>
                  <Text
                    style={[
                      MyStyles.sosReportType,
                      { color: "black", fontFamily: "REMMedium" },
                    ]}
                  >
                    {enrichedReport.resID.firstname}{" "}
                    {enrichedReport.resID.lastname}
                  </Text>
                  <Text style={MyStyles.sosDetailsText}>
                    {enrichedReport.resID.age} years old
                  </Text>
                </View>
              </View>

              <View style={MyStyles.sosDetailsWrapper}>
                <View
                  style={[
                    MyStyles.sosDetailsRowWrapper,
                    { alignItems: "flex-start" },
                  ]}
                >
                  <Text style={MyStyles.sosDetailsTitle}>Address:</Text>
                  <Text
                    style={[
                      MyStyles.sosDetailsAnswer,
                      {
                        flexShrink: 1,
                        flexWrap: "wrap",
                      },
                    ]}
                  >
                    {enrichedReport.resID.householdno
                      ? enrichedReport.resID.householdno?.address
                      : "N/A"}
                  </Text>
                </View>

                <View style={MyStyles.sosDetailsRowWrapper}>
                  <Text style={MyStyles.sosDetailsTitle}>Mobile:</Text>
                  <Text style={MyStyles.sosDetailsAnswer}>
                    {enrichedReport.resID.mobilenumber}
                  </Text>
                </View>

                <View style={MyStyles.sosDetailsRowWrapper}>
                  <Text style={MyStyles.sosDetailsTitle}>
                    Type of Emergency:
                  </Text>
                  <Text style={MyStyles.sosDetailsAnswer}>
                    {enrichedReport?.reporttype
                      ? enrichedReport.reporttype
                      : "SOS"}
                  </Text>
                </View>

                <View style={MyStyles.sosDetailsColWrapper}>
                  <Text style={MyStyles.sosDetailsTitle}>Time Resolved:</Text>
                  <Text style={[MyStyles.sosDetailsAnswer, { marginLeft: 5 }]}>
                    {enrichedReport?.datePart} at {enrichedReport?.timePart}
                  </Text>
                </View>

                <View style={MyStyles.sosDetailsColWrapper}>
                  <Text style={MyStyles.sosDetailsTitle}>
                    Additional Details:
                  </Text>

                  <Text style={[MyStyles.sosDetailsAnswer, { marginLeft: 5 }]}>
                    {enrichedReport?.reportdetails
                      ? enrichedReport.reportdetails
                      : "N/A"}
                  </Text>
                </View>

                <View style={MyStyles.sosDetailsColWrapper}>
                  <Text style={MyStyles.sosDetailsTitle}>
                    Post Report Details:
                  </Text>
                  <Text style={[MyStyles.sosDetailsAnswer, { marginLeft: 5 }]}>
                    {enrichedReport?.postreportdetails}
                  </Text>
                </View>
                <View style={MyStyles.sosDetailsColWrapper}>
                  <Text style={MyStyles.sosDetailsTitle}>Evidence:</Text>
                  {enrichedReport?.evidence ? (
                    <Image
                      source={{
                        uri:
                          enrichedReport?.evidence ||
                          "https://via.placeholder.com/80",
                      }}
                      style={MyStyles.evidenceImg}
                    />
                  ) : (
                    <Text
                      style={[MyStyles.sosDetailsAnswer, { marginLeft: 5 }]}
                    >
                      N/A
                    </Text>
                  )}
                </View>

                <View style={MyStyles.sosMapWrapper}>
                  <View style={MyStyles.sosMapHeader}>
                    <Text style={MyStyles.sosMapHeaderText}>
                      Incident Location
                    </Text>
                  </View>

                  <MapView
                    style={{ flex: 1 }}
                    initialRegion={{
                      latitude: enrichedReport.location.lat,
                      longitude: enrichedReport.location.lng,
                      latitudeDelta: 0.002,
                      longitudeDelta: 0.002,
                    }}
                  >
                    <Marker
                      coordinate={{
                        latitude: enrichedReport.location.lat,
                        longitude: enrichedReport.location.lng,
                      }}
                      title="Location"
                      description={enrichedReport.readableAddress}
                    />
                  </MapView>
                </View>
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SOSRespondedDetails;
