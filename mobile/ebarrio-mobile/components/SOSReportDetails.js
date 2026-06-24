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
import { Entypo, MaterialIcons } from "@expo/vector-icons";
import { InfoContext } from "../context/InfoContext";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import MapView, { Marker } from "react-native-maps";
import api from "../api";
import AlertModal from "./AlertModal";
import { AntDesign } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";

const SOSReportDetails = () => {
  dayjs.extend(relativeTime);
  const route = useRoute();
  const { selectedID } = route.params;
  const insets = useSafeAreaInsets();
  const { user } = useContext(AuthContext);
  const { fetchPendingReports, pendingReports } = useContext(InfoContext);
  const navigation = useNavigation();
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
  const [isConfirmArrivedVisible, setIsConfirmArrivedVisible] = useState(false);
  const [isConfirmDidNotArrivedVisible, setIsConfirmDidNotArrivedVisible] =
    useState(false);
  const { width } = Dimensions.get("window");
  const [loading, setLoading] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const [isAlertModalVisible, setIsAlertModalVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    fetchPendingReports();
  }, []);

  const selectedReport = pendingReports?.find(
    (report) => report._id === selectedID
  );

  const responder = selectedReport?.responder?.find(
    (r) => r.empID.toString() === user.empID
  );

  const headingSOS = async () => {
    setIsConfirmModalVisible(false);
    if (loading) return;

    setLoading(true);
    try {
      await api.put(`/headingsos/${selectedID}`);
      setIsSuccess(true);
      setAlertMessage(
        "You have marked yourself as heading at the report location."
      );
      setIsAlertModalVisible(true);
    } catch (error) {
      console.error("❌ Failed to click heading:", error);
    } finally {
      setLoading(false);
    }
  };

  const arrivedSOS = async () => {
    setIsConfirmArrivedVisible(false);
    if (loading) return;

    setLoading(true);
    try {
      await api.put(`/arrivedsos/${selectedID}`);
      setIsSuccess(true);
      setAlertMessage(
        "You have marked yourself as arrived at the report location."
      );
      setIsAlertModalVisible(true);
    } catch (error) {
      console.error("❌ Failed to click arrived:", error);
    } finally {
      setLoading(false);
    }
  };

  const didntArriveSOS = async () => {
    setIsConfirmDidNotArrivedVisible(false);
    if (loading2) return;

    setLoading2(true);
    try {
      await api.put(`/didntarrivesos/${selectedID}`);
      setIsSuccess(true);
      setAlertMessage(
        "You have marked yourself as did not arrive at the report location."
      );
      setIsAlertModalVisible(true);
    } catch (error) {
      console.error("❌ Failed to click arrived:", error);
    } finally {
      setLoading2(false);
    }
  };

  const handleCloseAlertModal = () => {
    setIsAlertModalVisible(false);
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
            onPress={() => navigation.navigate("SOSRequests")}
            name="arrowleft"
            style={[MyStyles.backArrow, { color: "white" }]}
          />

          <Text style={[MyStyles.header, { color: "white" }]}>
            Report Details
          </Text>

          <Text
            style={[MyStyles.formMessage, { color: "white", opacity: 0.7 }]}
          >
            Please ensure the reported incident is legitimate before confirming
            any response.
          </Text>

          {selectedReport && (
            <View
              key={selectedReport._id}
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
                    {
                      backgroundColor:
                        selectedReport.status === "False Alarm"
                          ? "red"
                          : selectedReport.status === "Pending"
                          ? "orange"
                          : selectedReport.status === "Ongoing"
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
                        : selectedReport.status === "Ongoing"
                        ? "checkmark-done-circle"
                        : "help-circle"
                    }
                    style={MyStyles.statusIcon}
                  />
                  <Text style={MyStyles.statusTitle}>
                    {selectedReport.status || "Pending"}
                  </Text>
                </View>

                <Text
                  style={[
                    MyStyles.sosDetailsText,
                    { textAlign: "right", flex: 1, color: "gray" },
                  ]}
                >
                  {dayjs(selectedReport.createdAt).fromNow()}
                </Text>
              </View>

              <View
                style={[
                  MyStyles.rowAlignment,
                  { justifyContent: "flex-start" },
                ]}
              >
                <View>
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
                          selectedReport?.resID?.picture ||
                          "https://via.placeholder.com/80",
                      }}
                      style={MyStyles.sosImg}
                    />
                  </View>
                </View>
                <View
                  style={{
                    marginLeft: 10,
                  }}
                >
                  <Text style={[MyStyles.sosReportType, { color: "#04384E" }]}>
                    {selectedReport.resID.firstname}{" "}
                    {selectedReport.resID.lastname}
                  </Text>
                  <Text style={[MyStyles.sosDetailsText, { color: "#04384E" }]}>
                    {selectedReport.resID.age} years old
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
                  {/* <Ionicons
                    name="location"
                    style={{
                      color: "red",
                      fontSize: 30,
                    }}
                  /> */}
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
                    {selectedReport.resID.householdno
                      ? selectedReport.resID.householdno?.address
                      : "N/A"}
                  </Text>
                </View>

                <View style={MyStyles.sosDetailsRowWrapper}>
                  {/* <Ionicons
                    name="call"
                    style={{ color: "red", fontSize: 30 }}
                  /> */}
                  <Text style={MyStyles.sosDetailsTitle}>Mobile:</Text>
                  <Text style={MyStyles.sosDetailsAnswer}>
                    {selectedReport.resID.mobilenumber}
                  </Text>
                </View>

                <View style={MyStyles.sosDetailsRowWrapper}>
                  <Text style={MyStyles.sosDetailsTitle}>
                    Type of Emergency:
                  </Text>
                  <Text style={MyStyles.sosDetailsAnswer}>
                    {selectedReport?.reporttype
                      ? selectedReport.reporttype
                      : "SOS"}
                  </Text>
                </View>

                <View style={MyStyles.sosDetailsColWrapper}>
                  <Text style={MyStyles.sosDetailsTitle}>
                    Additional Details:
                  </Text>
                  <Text style={MyStyles.sosDetailsAnswer}>
                    {" "}
                    {selectedReport?.reportdetails
                      ? selectedReport.reportdetails
                      : "N/A"}
                  </Text>
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
                      latitude: selectedReport.location.lat,
                      longitude: selectedReport.location.lng,
                      latitudeDelta: 0.002,
                      longitudeDelta: 0.002,
                    }}
                  >
                    <Marker
                      coordinate={{
                        latitude: selectedReport.location.lat,
                        longitude: selectedReport.location.lng,
                      }}
                      title="Location"
                      description={selectedReport.readableAddress}
                    />
                  </MapView>
                </View>
              </View>

              {responder ? (
                <>
                  {responder.status === "Heading" && (
                    <View style={{ marginTop: 30, gap: 20 }}>
                      <TouchableOpacity
                        onPress={() => setIsConfirmArrivedVisible(true)}
                        style={[
                          MyStyles.button,
                          { backgroundColor: "#00BA00" },
                        ]}
                        disabled={loading}
                      >
                        <Text style={MyStyles.buttonText}>
                          {loading ? "Loading..." : "Arrive"}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => setIsConfirmDidNotArrivedVisible(true)}
                        style={[
                          MyStyles.button,
                          { backgroundColor: "#BC0F0F" },
                        ]}
                        disabled={loading2}
                      >
                        <Text style={[MyStyles.buttonText]}>
                          {loading2 ? "Loading..." : "Did Not Arrive"}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {responder.status === "Arrived" && responder.isHead && (
                    <View style={{ marginTop: 30, gap: 20 }}>
                      <TouchableOpacity
                        onPress={() =>
                          navigation.navigate("PostIncident", { selectedID })
                        }
                        style={[
                          MyStyles.button,
                          { backgroundColor: "#00BA00" },
                        ]}
                        disabled={loading}
                      >
                        <Text style={MyStyles.buttonText}>Verify</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() =>
                          navigation.navigate("FalseAlarm", { selectedID })
                        }
                        style={[
                          MyStyles.button,
                          { backgroundColor: "#BC0F0F" },
                        ]}
                        disabled={loading}
                      >
                        <Text style={[MyStyles.buttonText, { color: "white" }]}>
                          False Alarm
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </>
              ) : (
                <TouchableOpacity
                  onPress={() => setIsConfirmModalVisible(true)}
                  style={[
                    MyStyles.button,
                    { marginTop: 30, backgroundColor: "#00BA00" },
                  ]}
                  disabled={loading}
                >
                  <Text style={MyStyles.buttonText}>
                    {loading ? "Loading..." : "Heading"}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
          <AlertModal
            isVisible={isConfirmModalVisible}
            isConfirmationModal={true}
            title="Heading?"
            message="Are you sure you want to proceed to this location?"
            onClose={() => setIsConfirmModalVisible(false)}
            onConfirm={headingSOS}
          />
          <AlertModal
            isVisible={isConfirmArrivedVisible}
            isConfirmationModal={true}
            title="Arrived?"
            message="Are you sure you arrived at the location?"
            onClose={() => setIsConfirmArrivedVisible(false)}
            onConfirm={arrivedSOS}
          />
          <AlertModal
            isVisible={isConfirmDidNotArrivedVisible}
            isConfirmationModal={true}
            title="Did Not Arrived?"
            message="Are you sure you did not arrive at the location?"
            onClose={() => setIsConfirmDidNotArrivedVisible(false)}
            onConfirm={didntArriveSOS}
          />
        </ScrollView>
        <AlertModal
          isVisible={isAlertModalVisible}
          message={alertMessage}
          isSuccess={isSuccess}
          onClose={() => setIsAlertModalVisible(false)}
          onConfirm={handleCloseAlertModal}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SOSReportDetails;
