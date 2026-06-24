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
  ActivityIndicator,
} from "react-native";
import { MyStyles } from "./stylesheet/MyStyles";
import { useContext, useState, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from "../context/AuthContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { InfoContext } from "../context/InfoContext";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Ionicons } from "@expo/vector-icons";
import AntDesign from "@expo/vector-icons/AntDesign";

const SOSRequests = () => {
  dayjs.extend(relativeTime);
  const insets = useSafeAreaInsets();
  const { user } = useContext(AuthContext);
  const { fetchPendingReports, pendingReports, setPendingReports } =
    useContext(InfoContext);
  const navigation = useNavigation();
  const [modifiedReports, setModifiedReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchPendingReports();
      setLoading(false);
    };

    loadData();
  }, []);

  useEffect(() => {
    const enrichReports = async () => {
      if (pendingReports && pendingReports.length > 0) {
        const updatedReports = await Promise.all(
          pendingReports
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .map(async (report) => {
              if (report.location?.lat && report.location?.lng) {
                const address = await getReadableAddress(
                  report.location.lat,
                  report.location.lng
                );
                return { ...report, readableAddress: address || "Unknown" };
              }
              return { ...report, readableAddress: "No location available" };
            })
        );
        setModifiedReports(updatedReports);
      }
    };

    enrichReports();
  }, [pendingReports]);

  function formatAddress(components) {
    let streetNumber = "";
    let route = "";
    let city = "";
    let province = "";

    components.forEach((comp) => {
      if (comp.types.includes("street_number")) streetNumber = comp.long_name;
      if (comp.types.includes("route")) route = comp.long_name;
      if (comp.types.includes("locality")) city = comp.long_name;
      if (comp.types.includes("administrative_area_level_2"))
        province = comp.long_name;
    });

    const addressParts = [streetNumber, route, city, province].filter(Boolean);
    return addressParts.join(", ");
  }

  const getReadableAddress = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=AIzaSyC3T3SOxoBKrTVpuJwvxGZIBQKg2iuFHGE`
      );
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        return formatAddress(data.results[0].address_components);
      }
      return null;
    } catch (error) {
      console.error("Error fetching address:", error);
      return null;
    }
  };

  const viewDetails = (selectedID) => {
    const selectedReport = modifiedReports.find(
      (report) => report._id === selectedID
    );
    navigation.navigate("SOSReportDetails", {
      selectedID,
    });
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
            {
              backgroundColor: "#BC0F0F",
              gap: 10,
            },
          ]}
        >
          <AntDesign
            onPress={() => navigation.navigate("BottomTabs")}
            name="arrowleft"
            style={[MyStyles.backArrow, { color: "white" }]}
          />

          <Text
            style={[MyStyles.header, { fontFamily: "REMBold", color: "white" }]}
          >
            SOS Requests
          </Text>
          <Text
            style={[MyStyles.formMessage, { color: "white", opacity: 0.7 }]}
          >
            Each SOS request must be verified for urgency and validity before
            action is taken
          </Text>

          {loading ? (
            <ActivityIndicator size="large" color="white" />
          ) : pendingReports.length === 0 ? (
            <Text style={[MyStyles.noEvents, { color: "#fff", opacity: 0.7 }]}>
              No pending SOS requests found.
            </Text>
          ) : (
            modifiedReports.map((report) => {
              let badgeColor = "gray";
              let badgeIcon = "help-circle";

              if (report.status === "False Alarm") {
                badgeColor = "red";
                badgeIcon = "alert-circle";
              } else if (report.status === "Pending") {
                badgeColor = "orange";
                badgeIcon = "time";
              } else if (report.status === "Ongoing") {
                badgeColor = "green";
                badgeIcon = "checkmark-done-circle";
              }

              return (
                <TouchableOpacity
                  onPress={() => viewDetails(report._id)}
                  key={report._id}
                  style={[MyStyles.sosCard, MyStyles.shadow]}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      width: "100%",
                      alignContent: "center",
                    }}
                  >
                    <View
                      style={[
                        MyStyles.statusWrapper,
                        { backgroundColor: badgeColor },
                      ]}
                    >
                      <Ionicons name={badgeIcon} style={MyStyles.statusIcon} />
                      <Text style={MyStyles.statusTitle}>
                        {report.status || "Pending"}
                      </Text>
                    </View>
                    <Text
                      style={[
                        MyStyles.sosDetailsText,
                        { textAlign: "right", flex: 1, color: "gray" },
                      ]}
                    >
                      {dayjs(report.createdAt).fromNow()}
                    </Text>
                  </View>

                  <View style={MyStyles.rowAlignment}>
                    <View
                      style={[
                        MyStyles.shadow,
                        {
                          backgroundColor: "#fff",
                          padding: 5,
                          borderRadius: 50,
                        },
                      ]}
                    >
                      <Image
                        source={{
                          uri:
                            report.resID?.picture ||
                            "https://via.placeholder.com/150",
                        }}
                        style={[MyStyles.sosImg]}
                      />
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={MyStyles.sosReportType}>
                        {report.reporttype ? report.reporttype : "SOS"}
                      </Text>

                      <View style={MyStyles.sosAddressTimeWrapper}>
                        <Text style={MyStyles.sosDetailsText}>
                          #{report.readableAddress || "No location available"}
                        </Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SOSRequests;
