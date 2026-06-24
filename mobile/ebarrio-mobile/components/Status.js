import {
  Text,
  View,
  Alert,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Linking,
} from "react-native";
import { MyStyles } from "./stylesheet/MyStyles";
import { useContext, useState, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from "../context/AuthContext";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Dropdown } from "react-native-element-dropdown";
import { InfoContext } from "../context/InfoContext";
import api from "../api";
import Dialog from "react-native-dialog";
import { RFPercentage } from "react-native-responsive-fontsize";

//ICONS
import { AntDesign, MaterialIcons } from "@expo/vector-icons";

const Status = () => {
  const { fetchServices, services } = useContext(InfoContext);
  const { fetchUserDetails, userDetails } = useContext(InfoContext);
  const insets = useSafeAreaInsets();
  const [sortOption, setSortOption] = useState("All");
  const [certVisible, setCertVisible] = useState(false);
  const [certReason, setCertReason] = useState("");
  const [reservationVisible, setReservationVisible] = useState(false);
  const [reservationReason, setReservationReason] = useState("");
  const [selectedCertID, setSelectedCertID] = useState(null);
  const [selectedCertCreated, setSelectedCertCreated] = useState(null);
  const [selectedReservationID, setSelectedReservationID] = useState(null);
  const [selectedReservationCreated, setSelectedReservationCreated] =
    useState(null);
  dayjs.extend(relativeTime);
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true); // START
      await fetchServices();
      await fetchUserDetails();
      setLoading(false); // END
    };

    loadData();
  }, []);
  const filteredServices = services.filter((service) => {
    if (sortOption === "documents") {
      return service.type === "Certificate";
    } else if (sortOption === "reservations") {
      return service.type === "Reservation";
    } else if (sortOption === "blotters") {
      return service.type === "Blotter";
    }
    return true;
  });

  const sortedServices = [...filteredServices].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  const certCancelClick = (certID, createdAt) => {
    setCertVisible(true);
    setSelectedCertID(certID);
    setSelectedCertCreated(createdAt);
  };

  const reservationCancelClick = (reservationID, createdAt) => {
    setReservationVisible(true);
    setSelectedReservationID(reservationID);
    setSelectedReservationCreated(createdAt);
  };

  const cancelCertificate = async () => {
    const now = new Date();
    const createdTime = new Date(selectedCertCreated);
    const diffInMinutes = (now - createdTime) / 60000;
    if (diffInMinutes > 50) {
      alert("Cancellation is only allowed within 50 minutes after submission");
      return;
    }
    try {
      await api.put(`/cancelcertrequest/${selectedCertID}`, { certReason });
      setCertVisible(false);
      alert("Certificate cancelled successfully!");
    } catch (error) {
      console.log("Error in cancelling certificate", error);
    }
  };

  const cancelReservation = async () => {
    const now = new Date();
    const createdTime = new Date(selectedReservationCreated);
    const diffInMinutes = (now - createdTime) / 60000;
    if (diffInMinutes > 50) {
      alert("Cancellation is only allowed within 50 minutes after submission");
      return;
    }

    try {
      await api.put(`/cancelreservationrequest/${selectedReservationID}`, {
        reservationReason,
      });
      setReservationVisible(false);
      alert("Court reservation cancelled successfully!");
    } catch (error) {
      console.log("Error in cancelling court reservation", error);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "Pending":
        return { color: "#E5DE48", label: "Pending" }; // Yellow
      case "Resolved":
      case "Approved":
      case "Settled":
      case "Scheduled":
      case "Collected":
        return { color: "#00BA00", label: status }; // Green
      case "Rejected":
      case "Cancelled":
        return { color: "#BC0F0F", label: status }; // Red
      case "Not Yet Collected":
        return { color: "#aaa", label: status }; // Gray
    }
  };

  const [expandedIndex, setExpandedIndex] = useState(null);

  const toggleExpand = (index) => {
    setExpandedIndex((prev) => (prev === index ? null : index));
  };

  const truncateDetails = (details, wordLimit = 25) => {
    const words = details.split(" ");
    return words.length > wordLimit
      ? words.slice(0, wordLimit).join(" ") + " ..."
      : details;
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
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            MyStyles.scrollContainer,
            {
              gap: 10,
            },
          ]}
        >
          <AntDesign
            onPress={() => navigation.navigate("BottomTabs")}
            name="arrowleft"
            style={MyStyles.backArrow}
          />

          <Text style={[MyStyles.servicesHeader, { marginTop: 0 }]}>
            Status
          </Text>

          <Dropdown
            data={[
              { label: "All", value: "all" },
              { label: "Documents", value: "documents" },
              { label: "Blotters", value: "blotters" },
              { label: "Reservations", value: "reservations" },
            ]}
            labelField="label"
            valueField="value"
            value={sortOption}
            placeholder={sortOption}
            onChange={(item) => setSortOption(item.value)}
            style={[MyStyles.dropdownWrapper, { width: RFPercentage(20) }]}
            selectedTextStyle={MyStyles.dropdownText}
          />

          <View style={{ marginVertical: 10 }}>
            {/* Green Box (Issued, Resolved, Approved, Settled, Scheduled, Collected) */}
            <View style={MyStyles.legendRow}>
              <View
                style={[
                  MyStyles.statusColorBox,
                  { backgroundColor: "#00BA00" },
                ]}
              />
              <Text style={MyStyles.legendLabel}>
                Resolved, Approved, Settled, Scheduled, Collected
              </Text>
            </View>

            {/* Yellow Box (Pending) */}
            <View style={MyStyles.legendRow}>
              <View
                style={[
                  MyStyles.statusColorBox,
                  { backgroundColor: "#E5DE48" },
                ]}
              />
              <Text style={MyStyles.legendLabel}>Pending</Text>
            </View>

            {/* Red Box (Rejected, Cancelled) */}
            <View style={MyStyles.legendRow}>
              <View
                style={[
                  MyStyles.statusColorBox,
                  { backgroundColor: "#BC0F0F" },
                ]}
              />
              <Text style={MyStyles.legendLabel}>Rejected, Cancelled</Text>
            </View>

            {/* Gray Box (Others) */}
            <View style={MyStyles.legendRow}>
              <View
                style={[MyStyles.statusColorBox, { backgroundColor: "#aaa" }]}
              />
              <Text style={MyStyles.legendLabel}>Not Yet Collected</Text>
            </View>
          </View>

          <Dialog.Container
            visible={certVisible}
            contentStyle={MyStyles.statusDialogWrapper}
          >
            <Dialog.Title style={MyStyles.cancelCert}>
              Cancel Document
            </Dialog.Title>

            <Dialog.Input
              placeholder="Enter your reason here..."
              onChangeText={(text) => setCertReason(text)}
              style={{
                fontFamily: "QuicksandMedium",
                fontSize: RFPercentage(2),
                color: "#04384E",
              }}
              placeholderTextColor="#808080"
            />

            <Dialog.Button
              label="Cancel"
              onPress={() => setCertVisible(false)}
              style={{ color: "#0E94D3", fontFamily: "REMSemiBold" }}
            />
            <Dialog.Button
              label="Submit"
              onPress={cancelCertificate}
              style={{ color: "#BC0F0F", fontFamily: "REMSemiBold" }}
            />
          </Dialog.Container>

          <Dialog.Container
            visible={reservationVisible}
            contentStyle={MyStyles.statusDialogWrapper}
          >
            <Dialog.Title style={MyStyles.cancelReserve}>
              Cancel Court Reservation
            </Dialog.Title>

            <Dialog.Input
              placeholder="Enter your reason here..."
              onChangeText={(text) => setReservationReason(text)}
              style={{
                fontFamily: "QuicksandMedium",
                fontSize: RFPercentage(2),
                padding: 10,
                color: "#04384E",
              }}
              placeholderTextColor="#808080"
            />

            <Dialog.Button
              label="Cancel"
              onPress={() => setReservationVisible(false)}
              color="#666"
            />
            <Dialog.Button
              label="Submit"
              onPress={cancelReservation}
              color="#BC0F0F"
            />
          </Dialog.Container>

          {loading ? (
            <View style={{ paddingVertical: 30, alignItems: "center" }}>
              <ActivityIndicator size="large" color="#04384E" />
            </View>
          ) : sortedServices.length === 0 ? (
            <View style={{ paddingVertical: 30, alignItems: "center" }}>
              <Text style={MyStyles.noEvents}>NO REQUEST STATUS FOUND</Text>
            </View>
          ) : (
            sortedServices.map((service, index) => {
              const isExpanded = expandedIndex === index;
              const status = getStatusStyle(service.status);

              return (
                <View key={index} style={MyStyles.statusCardWrapper}>
                  {/* Left status bar */}
                  <View
                    style={{
                      width: 15,
                      backgroundColor: status.color,
                    }}
                  />
                  {/* Right content */}
                  <View style={{ flex: 1, padding: 15 }}>
                    <View style={MyStyles.rowAlignment}>
                      <Text style={MyStyles.statusLabel}>{status.label}</Text>

                      <Text
                        style={{
                          fontSize: RFPercentage(1.8),
                          color: "#808080",
                        }}
                      >
                        {dayjs(service.createdAt).fromNow()}
                      </Text>
                    </View>

                    <View style={MyStyles.statusLine} />

                    {/* Title + Chevron */}
                    <TouchableOpacity
                      style={MyStyles.rowAlignment}
                      onPress={() => toggleExpand(index)}
                      activeOpacity={0.7}
                    >
                      <Text style={MyStyles.statusServiceType}>
                        {service.type === "Certificate"
                          ? "Document"
                          : service.type}
                      </Text>
                      <MaterialIcons
                        name={
                          isExpanded
                            ? "keyboard-arrow-up"
                            : "keyboard-arrow-down"
                        }
                        size={24}
                        color="#04384E"
                      />
                    </TouchableOpacity>

                    {/* Default visible summary based on type */}
                    <View style={{ marginTop: 5 }}>
                      {service.type === "Certificate" && (
                        <Text style={MyStyles.statusTypeofCert}>
                          {service.typeofcertificate}
                        </Text>
                      )}
                      {service.type === "Reservation" &&
                        service.times &&
                        Object.entries(service.times).map(
                          ([date, timeData]) => {
                            const start = new Date(timeData.starttime);
                            const end = new Date(timeData.endtime);

                            return (
                              <Text
                                key={date}
                                style={MyStyles.statusTypeofCert}
                              >
                                {new Date(date).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })}{" "}
                                {start.toLocaleTimeString("en-US", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}{" "}
                                -{" "}
                                {end.toLocaleTimeString("en-US", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </Text>
                            );
                          }
                        )}
                      {service.type === "Blotter" && (
                        <View style={MyStyles.statusBlotterWrapper}>
                          <Text
                            style={{
                              fontSize: RFPercentage(1.8),
                              fontFamily: "QuicksandSemiBold",
                              color: "#04384E",
                            }}
                          >
                            Details:
                          </Text>
                          <Text style={MyStyles.statusServiceDetails}>
                            {!isExpanded
                              ? truncateDetails(service.details)
                              : service.details}
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Expanded content */}
                    {isExpanded && (
                      <View style={{ marginTop: 10 }}>
                        {service.type === "Certificate" && (
                          <>
                            {(service.typeofcertificate ===
                              "Barangay Indigency" ||
                              service.typeofcertificate ===
                                "Barangay Clearance") && (
                              <>
                                <View style={MyStyles.statusBlotterWrapper}>
                                  <Text
                                    style={[
                                      MyStyles.statusLabel,
                                      { fontFamily: "QuicksandBold" },
                                    ]}
                                  >
                                    Purpose:
                                  </Text>
                                  <Text style={MyStyles.statusServiceDetails}>
                                    {service.purpose}
                                  </Text>
                                </View>

                                <View style={MyStyles.statusBlotterWrapper}>
                                  <Text
                                    style={[
                                      MyStyles.statusLabel,
                                      { fontFamily: "QuicksandBold" },
                                    ]}
                                  >
                                    Amount:
                                  </Text>
                                  <Text style={MyStyles.statusServiceDetails}>
                                    {service.amount}
                                  </Text>
                                </View>
                              </>
                            )}

                            {service.typeofcertificate ===
                              "Barangay Business Clearance" && (
                              <>
                                <View style={MyStyles.statusBlotterWrapper}>
                                  <Text
                                    style={[
                                      MyStyles.statusLabel,
                                      { fontFamily: "QuicksandBold" },
                                    ]}
                                  >
                                    Business Name:
                                  </Text>
                                  <Text style={MyStyles.statusServiceDetails}>
                                    {service.businessname}
                                  </Text>
                                </View>

                                <View style={MyStyles.statusBlotterWrapper}>
                                  <Text
                                    style={[
                                      MyStyles.statusLabel,
                                      { fontFamily: "QuicksandBold" },
                                    ]}
                                  >
                                    Line of Business:
                                  </Text>
                                  <Text style={MyStyles.statusServiceDetails}>
                                    {service.lineofbusiness}
                                  </Text>
                                </View>

                                <View style={MyStyles.statusBlotterWrapper}>
                                  <Text
                                    style={[
                                      MyStyles.statusLabel,
                                      { fontFamily: "QuicksandBold" },
                                    ]}
                                  >
                                    Location of Business:
                                  </Text>
                                  <Text style={MyStyles.statusServiceDetails}>
                                    {service.locationofbusiness ===
                                    "Resident's Address"
                                      ? userDetails.resID.address
                                      : service.locationofbusiness}
                                  </Text>
                                </View>
                              </>
                            )}

                            {service.status === "Pending" &&
                              new Date(service.createdAt) >=
                                new Date(
                                  new Date().getTime() - 50 * 60 * 1000
                                ) && (
                                <TouchableOpacity
                                  onPress={() =>
                                    certCancelClick(
                                      service._id,
                                      service.createdAt
                                    )
                                  }
                                  style={[
                                    MyStyles.button,
                                    {
                                      marginTop: 15,
                                      backgroundColor: "#BC0F0F",
                                    },
                                  ]}
                                >
                                  <Text style={MyStyles.buttonText}>
                                    Cancel
                                  </Text>
                                </TouchableOpacity>
                              )}

                            {(service.status === "Issued" ||
                              service.status === "Collected" ||
                              service.status === "Not Yet Collected") && (
                              <TouchableOpacity
                                onPress={() => Linking.openURL(service.pdf)}
                                style={[
                                  MyStyles.button,
                                  {
                                    marginTop: 15,
                                    backgroundColor: "#0e94d3",
                                  },
                                ]}
                              >
                                <Text style={MyStyles.buttonText}>
                                  View PDF
                                </Text>
                              </TouchableOpacity>
                            )}

                            {service.status === "Rejected" && (
                              <View style={MyStyles.statusBlotterWrapper}>
                                <Text
                                  style={[
                                    MyStyles.statusLabel,
                                    { fontFamily: "QuicksandBold" },
                                  ]}
                                >
                                  Remarks:
                                </Text>
                                <Text style={MyStyles.statusRemarksText}>
                                  {service.remarks}
                                </Text>
                              </View>
                            )}
                          </>
                        )}

                        {service.type === "Reservation" && (
                          <>
                            {service.status === "Pending" &&
                              new Date(service.createdAt) >=
                                new Date(
                                  new Date().getTime() - 50 * 60 * 1000
                                ) && (
                                <TouchableOpacity
                                  onPress={() =>
                                    reservationCancelClick(
                                      service._id,
                                      service.createdAt
                                    )
                                  }
                                  style={[
                                    MyStyles.button,
                                    {
                                      marginTop: 15,
                                      backgroundColor: "#BC0F0F",
                                    },
                                  ]}
                                >
                                  <Text style={MyStyles.buttonText}>
                                    Cancel
                                  </Text>
                                </TouchableOpacity>
                              )}
                            {service.status === "Rejected" && (
                              <View style={MyStyles.statusBlotterWrapper}>
                                <Text
                                  style={[
                                    MyStyles.statusLabel,
                                    { fontFamily: "QuicksandBold" },
                                  ]}
                                >
                                  Remarks:
                                </Text>
                                <Text style={MyStyles.statusRemarksText}>
                                  {service.remarks}
                                </Text>
                              </View>
                            )}
                          </>
                        )}

                        {service.type === "Blotter" && (
                          <>
                            <View style={MyStyles.statusBlotterWrapper}>
                              <Text
                                style={[
                                  MyStyles.statusLabel,
                                  { fontFamily: "QuicksandBold" },
                                ]}
                              >
                                Type of the Complaint:
                              </Text>
                              <Text style={MyStyles.statusServiceDetails}>
                                {service.typeofthecomplaint}
                              </Text>
                            </View>

                            <View style={MyStyles.statusBlotterWrapper}>
                              <Text
                                style={[
                                  MyStyles.statusLabel,
                                  { fontFamily: "QuicksandBold" },
                                ]}
                              >
                                Subject:
                              </Text>
                              <Text style={MyStyles.statusServiceDetails}>
                                {service.subjectID
                                  ? `${service.subjectID.firstname} ${service.subjectID.lastname}`
                                  : service.subjectname}
                              </Text>
                            </View>

                            {(service.status === "Scheduled" ||
                              service.status === "Settled") && (
                              <View style={MyStyles.statusBlotterWrapper}>
                                <Text
                                  style={[
                                    MyStyles.statusLabel,
                                    { fontFamily: "QuicksandBold" },
                                  ]}
                                >
                                  Meeting:
                                </Text>
                                <Text style={MyStyles.statusRemarksText}>
                                  {new Date(
                                    service.starttime
                                  ).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  })}{" "}
                                  {new Date(
                                    service.starttime
                                  ).toLocaleTimeString("en-US", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}{" "}
                                  -{" "}
                                  {new Date(service.endtime).toLocaleTimeString(
                                    "en-US",
                                    {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    }
                                  )}
                                </Text>
                              </View>
                            )}

                            {service.status === "Settled" && (
                              <>
                                <View style={MyStyles.statusBlotterWrapper}>
                                  <Text
                                    style={[
                                      MyStyles.statusLabel,
                                      { fontFamily: "QuicksandBold" },
                                    ]}
                                  >
                                    Witness:
                                  </Text>
                                  <Text style={MyStyles.statusServiceDetails}>
                                    {service.witnessID
                                      ? `${service.witnessID.firstname} ${service.witnessID.lastname}`
                                      : service.witnessname}
                                  </Text>
                                </View>

                                <View style={MyStyles.statusBlotterWrapper}>
                                  <Text
                                    style={[
                                      MyStyles.statusLabel,
                                      { fontFamily: "QuicksandBold" },
                                    ]}
                                  >
                                    Agreement:
                                  </Text>
                                  <Text style={MyStyles.statusServiceDetails}>
                                    {!isExpanded
                                      ? truncateWords(service.agreementdetails)
                                      : service.agreementdetails}
                                  </Text>
                                </View>
                              </>
                            )}

                            {service.status === "Rejected" && (
                              <View style={MyStyles.statusBlotterWrapper}>
                                <Text
                                  style={[
                                    MyStyles.statusLabel,
                                    { fontFamily: "QuicksandBold" },
                                  ]}
                                >
                                  Remarks:
                                </Text>
                                <Text style={MyStyles.statusRemarksText}>
                                  {service.remarks}
                                </Text>
                              </View>
                            )}
                          </>
                        )}
                      </View>
                    )}
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Status;
