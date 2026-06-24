import { useContext, useState, useEffect } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TextInput,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from "../context/AuthContext";
import { Dropdown } from "react-native-element-dropdown";
import DateTimePicker from "@react-native-community/datetimepicker";
import api from "../api";
import { InfoContext } from "../context/InfoContext";
import { MyStyles } from "./stylesheet/MyStyles";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Calendar } from "react-native-calendars";
import AlertModal from "./AlertModal";

//ICONS
import { MaterialIcons } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";

const CourtReservations = () => {
  const insets = useSafeAreaInsets();
  const { fetchReservations, courtreservations } = useContext(InfoContext);
  const { user } = useContext(AuthContext);
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
  const [isAlertModalVisible, setIsAlertModalVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const [reservationForm, setReservationForm] = useState({
    resID: user.resID || "",
    purpose: "",
    purpose2: "",
    date: [],
    times: {},
    amount: "",
  });

  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [selectedDateForTime, setSelectedDateForTime] = useState(null);

  useEffect(() => {
    fetchReservations();
  }, []);

  const purpose = ["Basketball", "Birthday Party", "Zumba", "Others"];
  const hourlyRate = 100;

  const markedDates = reservationForm.date.reduce((acc, d) => {
    acc[d] = { selected: true, selectedColor: "#00adf5" };
    return acc;
  }, {});

  const onDayPress = (day) => {
    const dateStr = day.dateString;

    setReservationForm((prev) => {
      let newDates;
      let newTimes = { ...prev.times };

      if (prev.date.includes(dateStr)) {
        newDates = prev.date.filter((d) => d !== dateStr);
        const { [dateStr]: removed, ...restTimes } = newTimes;
        newTimes = restTimes;

        if (selectedDateForTime === dateStr) {
          if (newDates.length > 0) {
            setSelectedDateForTime(newDates[0]);
          } else {
            setSelectedDateForTime(null);
          }
        }
      } else {
        newDates = [...prev.date, dateStr];
        if (!newTimes[dateStr]) {
          newTimes[dateStr] = {
            starttime: new Date(1970, 0, 1, 9, 0),
            endtime: new Date(1970, 0, 1, 10, 0),
          };
        }
        setSelectedDateForTime(dateStr);
      }

      return {
        ...prev,
        date: newDates,
        times: newTimes,
      };
    });
  };

  useEffect(() => {
    let totalHours = 0;

    for (const date of reservationForm.date) {
      const times = reservationForm.times[date];
      if (times) {
        let startTime = new Date(times.starttime);
        let endTime = new Date(times.endtime);
        startTime.setFullYear(1970, 0, 1);
        endTime.setFullYear(1970, 0, 1);
        if (endTime > startTime) {
          totalHours += (endTime - startTime) / (1000 * 3600);
        }
      }
    }

    const totalAmount =
      totalHours > 0 ? "₱" + Math.round(totalHours * hourlyRate) : "";

    setReservationForm((prev) => ({
      ...prev,
      amount: totalAmount,
    }));
  }, [reservationForm.times, reservationForm.date]);

  const onPurposeChange = (value) => {
    setReservationForm((prev) => ({
      ...prev,
      purpose: value,
    }));
  };

  const onStartTimeChange = (event, selectedTime) => {
    setShowStartTimePicker(false);
    if (selectedTime && selectedDateForTime) {
      setReservationForm((prev) => ({
        ...prev,
        times: {
          ...prev.times,
          [selectedDateForTime]: {
            ...prev.times[selectedDateForTime],
            starttime: selectedTime,
          },
        },
        amount: "",
      }));
      setErrorMsg("");
    }
  };

  const onEndTimeChange = (event, selectedTime) => {
    setShowEndTimePicker(false);
    if (selectedTime && selectedDateForTime) {
      const dateStart = new Date(selectedDateForTime);

      const startDateTime = new Date(dateStart);
      startDateTime.setHours(
        reservationForm.times[selectedDateForTime].starttime.getHours()
      );
      startDateTime.setMinutes(
        reservationForm.times[selectedDateForTime].starttime.getMinutes()
      );

      const endDateTime = new Date(dateStart);
      endDateTime.setHours(selectedTime.getHours());
      endDateTime.setMinutes(selectedTime.getMinutes());

      if (endDateTime <= startDateTime) {
        setAlertMessage("End time must be after start time.");
        setIsAlertModalVisible(true);
        return;
      }

      setReservationForm((prev) => ({
        ...prev,
        times: {
          ...prev.times,
          [selectedDateForTime]: {
            ...prev.times[selectedDateForTime],
            endtime: selectedTime,
          },
        },
        amount: "",
      }));
      setErrorMsg("");
    }
  };

  const handleConfirm = () => {
    if (reservationForm.date.length === 0 && !reservationForm.purpose) {
      setAlertMessage("Both fields need to be filled to reserve a court.");
      setIsAlertModalVisible(true);
      return;
    }

    if (reservationForm.date.length === 0) {
      setAlertMessage("Please select at least one date.");
      setIsAlertModalVisible(true);
      return;
    }

    if (!reservationForm.purpose) {
      setAlertMessage("Please select a purpose.");
      setIsAlertModalVisible(true);
      return;
    }

    if (reservationForm.purpose === "Others" && !reservationForm.purpose2) {
      setAlertMessage("Please specify the purpose.");
      setIsAlertModalVisible(true);
      return;
    }

    if (errorMsg) {
      setAlertMessage(errorMsg);
      setIsAlertModalVisible(true);
      return;
    }

    const combineDateAndTime = (dateStr, timeObj) => {
      const date = new Date(dateStr);
      date.setHours(timeObj.getHours());
      date.setMinutes(timeObj.getMinutes());
      date.setSeconds(timeObj.getSeconds());
      date.setMilliseconds(timeObj.getMilliseconds());
      return date.toISOString();
    };

    // Collect all conflicts for all dates
    const conflicts = [];
    const preparedTimes = {};

    for (const date of reservationForm.date) {
      const times = reservationForm.times[date];
      if (!times) {
        setAlertMessage(`Times not set for ${date}.`);
        setIsAlertModalVisible(true);
        return;
      }
      const dateStart = new Date(date);
      const startDateTime = new Date(dateStart);
      startDateTime.setHours(times.starttime.getHours());
      startDateTime.setMinutes(times.starttime.getMinutes());

      const endDateTime = new Date(dateStart);
      endDateTime.setHours(times.endtime.getHours());
      endDateTime.setMinutes(times.endtime.getMinutes());

      if (endDateTime <= startDateTime) {
        setAlertMessage(`End time must be after start time on ${date}.`);
        return;
      }

      preparedTimes[date] = {
        starttime: combineDateAndTime(date, times.starttime),
        endtime: combineDateAndTime(date, times.endtime),
      };

      const conflict = courtreservations
        .filter(
          (r) =>
            r.status === "Approved" &&
            r.times?.[date]?.starttime &&
            r.times?.[date]?.endtime
        )
        .find((r) => {
          const reservedStart = new Date(r.times[date].starttime);
          const reservedEnd = new Date(r.times[date].endtime);

          return startDateTime < reservedEnd && endDateTime > reservedStart;
        });

      if (conflict) {
        conflicts.push({
          date,
          start: new Date(conflict.times[date].starttime),
          end: new Date(conflict.times[date].endtime),
        });
      }
    }

    if (conflicts.length > 0) {
      // Build a detailed alert message for all conflicts
      const conflictMessages = conflicts
        .map(
          (c) =>
            `${c.date} (${c.start.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })} - ${c.end.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })})`
        )
        .join("\n");

      setAlertMessage(
        `Time slots overlap with existing reservations on:\n${conflictMessages}`
      );
      setIsAlertModalVisible(true);
      return;
    }

    setIsConfirmModalVisible(true);
  };

  const handleSubmit = async () => {
    setIsConfirmModalVisible(false);
    if (loading) return;

    setLoading(true);
    const combineDateAndTime = (dateStr, timeObj) => {
      const date = new Date(dateStr);
      date.setHours(timeObj.getHours());
      date.setMinutes(timeObj.getMinutes());
      date.setSeconds(timeObj.getSeconds());
      date.setMilliseconds(timeObj.getMilliseconds());
      return date.toISOString();
    };

    const conflicts = [];
    const preparedTimes = {};
    for (const date of reservationForm.date) {
      const times = reservationForm.times[date];
      if (!times) {
        setAlertMessage(`Times not set for ${date}.`);
        setIsAlertModalVisible(true);
        return;
      }
      const dateStart = new Date(date);
      const startDateTime = new Date(dateStart);
      startDateTime.setHours(times.starttime.getHours());
      startDateTime.setMinutes(times.starttime.getMinutes());

      const endDateTime = new Date(dateStart);
      endDateTime.setHours(times.endtime.getHours());
      endDateTime.setMinutes(times.endtime.getMinutes());

      preparedTimes[date] = {
        starttime: combineDateAndTime(date, times.starttime),
        endtime: combineDateAndTime(date, times.endtime),
      };
    }
    let updatedForm = { ...reservationForm };

    if (updatedForm.purpose === "Others") {
      updatedForm.purpose = updatedForm.purpose2;
      delete updatedForm.purpose2;
    } else {
      delete updatedForm.purpose2;
    }
    try {
      await api.post("/sendreservationrequest", {
        reservationForm: {
          ...updatedForm,
          times: preparedTimes,
        },
      });
      navigation.navigate("SuccessfulPage", {
        service: "Reservation",
      });
    } catch (error) {
      console.log("Reservation submission error:", error);
      setAlertMessage("Failed to submit reservation. Please try again.");
      setIsAlertModalVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const renderDateSelector = () => {
    if (reservationForm.date.length === 0) return null;
    return (
      <View style={MyStyles.reserveDateWrapper}>
        {reservationForm.date.map((date) => (
          <TouchableOpacity
            key={date}
            onPress={() => setSelectedDateForTime(date)}
            style={[
              MyStyles.reserveDateBtn,
              {
                backgroundColor:
                  selectedDateForTime === date ? "#00adf5" : "#ddd",
              },
            ]}
          >
            <Text
              style={[
                MyStyles.reserveDateText,
                { color: selectedDateForTime === date ? "#fff" : "#000" },
              ]}
            >
              {date}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };
  const currentTimes = selectedDateForTime
    ? reservationForm.times[selectedDateForTime]
    : null;

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
          contentContainerStyle={[MyStyles.scrollContainer, { gap: 10 }]}
        >
          <AntDesign
            onPress={() => navigation.navigate("BottomTabs")}
            name="arrowleft"
            style={MyStyles.backArrow}
          />

          <Text style={[MyStyles.servicesHeader, { marginTop: 0 }]}>
            Reserve Court
          </Text>

          <Text style={MyStyles.formMessage}>
            1. Please fill out the required information for reserving a court.
            {"\n"}
            2. Make sure to fill in both the start and end times if you’re
            reserving the court for multiple days.
          </Text>

          <View style={MyStyles.servicesContentWrapper}>
            <View>
              <Text style={MyStyles.inputLabel}>
                Purpose<Text style={{ color: "red" }}>*</Text>
              </Text>
              <Dropdown
                labelField="label"
                valueField="value"
                value={reservationForm.purpose}
                data={purpose.map((p) => ({ label: p, value: p }))}
                onChange={(item) => onPurposeChange(item.value)}
                placeholder="Select"
                placeholderStyle={MyStyles.placeholderText}
                selectedTextStyle={MyStyles.selectedText}
                style={MyStyles.input}
              />
            </View>
            {reservationForm.purpose === "Others" && (
              <View>
                <Text style={MyStyles.inputLabel}>
                  Others (Please Specify)
                  <Text style={{ color: "red" }}>*</Text>
                </Text>
                <TextInput
                  placeholder="Purpose"
                  style={MyStyles.input}
                  value={reservationForm.purpose2}
                  type="text"
                  onChangeText={(text) =>
                    setReservationForm((prev) => ({
                      ...prev,
                      purpose2: text,
                    }))
                  }
                />
              </View>
            )}

            <View>
              <Text style={MyStyles.inputLabel}>
                Select Date(s) <Text style={{ color: "red" }}>*</Text>
              </Text>
              <Calendar
                markingType={"multi-dot"}
                markedDates={markedDates}
                onDayPress={onDayPress}
                minDate={new Date()}
                style={[MyStyles.shadow, { borderRadius: 10 }]}
              />
              {renderDateSelector()}
            </View>

            {selectedDateForTime && (
              <>
                <View>
                  <Text style={MyStyles.inputLabel}>
                    Start Time for {selectedDateForTime}
                    <Text style={{ color: "red" }}>*</Text>
                  </Text>

                  <View style={[MyStyles.input, MyStyles.datetimeRow]}>
                    <Text style={MyStyles.selectedText}>
                      {currentTimes?.starttime.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>

                    <MaterialIcons
                      onPress={() => setShowStartTimePicker((prev) => !prev)}
                      name="access-time"
                      size={24}
                      color="#C1C0C0"
                    />
                  </View>
                </View>

                {showStartTimePicker && (
                  <DateTimePicker
                    value={currentTimes?.starttime || new Date()}
                    mode="time"
                    is24Hour={false}
                    display="spinner"
                    onChange={onStartTimeChange}
                  />
                )}

                <View>
                  <Text style={MyStyles.inputLabel}>
                    End Time for {selectedDateForTime}
                    <Text style={{ color: "red" }}>*</Text>
                  </Text>

                  <View style={[MyStyles.input, MyStyles.datetimeRow]}>
                    <Text style={MyStyles.selectedText}>
                      {currentTimes?.endtime.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>

                    <MaterialIcons
                      onPress={() => setShowEndTimePicker((prev) => !prev)}
                      name="access-time"
                      size={24}
                      color="#C1C0C0"
                    />
                  </View>
                </View>

                {showEndTimePicker && (
                  <DateTimePicker
                    value={currentTimes?.endtime || new Date()}
                    mode="time"
                    is24Hour={false}
                    display="spinner"
                    onChange={onEndTimeChange}
                  />
                )}
              </>
            )}

            <View>
              <Text style={MyStyles.inputLabel}>Amount</Text>
              <TextInput
                editable={false}
                value={reservationForm.amount}
                style={MyStyles.selectedText}
              />
            </View>

            <TouchableOpacity
              style={MyStyles.button}
              onPress={handleConfirm}
              disabled={loading}
            >
              <Text style={MyStyles.buttonText}>
                {loading ? "Submitting..." : "Submit"}
              </Text>
            </TouchableOpacity>

            <AlertModal
              isVisible={isAlertModalVisible}
              message={alertMessage}
              onClose={() => setIsAlertModalVisible(false)}
            />

            <AlertModal
              isVisible={isConfirmModalVisible}
              isConfirmationModal={true}
              title="Reserve a Court?"
              message="Are you sure you want to reserve a court?"
              onClose={() => setIsConfirmModalVisible(false)}
              onConfirm={handleSubmit}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default CourtReservations;
