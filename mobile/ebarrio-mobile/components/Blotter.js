import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useContext, useState, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from "../context/AuthContext";
import { Dropdown } from "react-native-element-dropdown";
import api from "../api";
import { InfoContext } from "../context/InfoContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MyStyles } from "./stylesheet/MyStyles";
import AlertModal from "./AlertModal";

//ICONS
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";

const Blotter = () => {
  const insets = useSafeAreaInsets();
  const { user } = useContext(AuthContext);
  const { fetchResidents, residents } = useContext(InfoContext);
  const navigation = useNavigation();
  const [subjectSuggestions, setSubjectSuggestions] = useState([]);
  const [typeErrors, setTypeErrors] = useState(null);
  const [subjectError, setSubjectError] = useState(null);
  const [detailsError, setDetailsError] = useState(null);
  const [typeErrors2, setTypeErrors2] = useState(null);
  const initialForm = {
    complainantID: user.resID,
    subjectID: "",
    subjectname: "",
    subjectaddress: "",
    typeofthecomplaint: "",
    typeofthecomplaint2: "",
    details: "",
  };

  const [loading, setLoading] = useState(false);
  const [blotterForm, setBlotterForm] = useState(initialForm);
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);

  useEffect(() => {
    fetchResidents();
  }, []);

  const typeList = [
    "Theft",
    "Assault",
    "Physical Injury",
    "Trespassing",
    "Property Damage",
    "Domestic Dispute",
    "Others",
  ];

  const handleConfirm = async () => {
    let hasError = false;

    if (!blotterForm.typeofthecomplaint) {
      setTypeErrors("This field is required!");
      hasError = true;
    } else {
      setTypeErrors(null);
    }

    if (
      blotterForm.typeofthecomplaint === "Others" &&
      !blotterForm.typeofthecomplaint2
    ) {
      setTypeErrors2("This field is required!");
      hasError = true;
    } else {
      setTypeErrors2(null);
    }

    if (!blotterForm.subjectID) {
      if (!blotterForm.subjectname) {
        setSubjectError("This field is required!");
        hasError = true;
      } else {
        setSubjectError(null);
      }
    } else {
      setSubjectError(null);
    }
    if (!blotterForm.details) {
      setDetailsError("This field is required!");
      hasError = true;
    } else {
      setDetailsError(null);
    }

    if (hasError) {
      return;
    }

    setIsConfirmModalVisible(true);
  };

  const handleSubmit = async () => {
    setIsConfirmModalVisible(false);
    if (loading) return;

    setLoading(true);
    let updatedForm = { ...blotterForm };
    if (updatedForm.subjectID) {
      delete updatedForm.subjectname;
      delete updatedForm.subjectaddress;
    } else {
      delete updatedForm.subjectID;
    }

    if (updatedForm.typeofthecomplaint === "Others") {
      updatedForm.typeofthecomplaint = updatedForm.typeofthecomplaint2;
      delete updatedForm.typeofthecomplaint2;
    } else {
      delete updatedForm.typeofthecomplaint2;
    }
    try {
      await api.post("/sendblotter", {
        updatedForm,
      });
      setBlotterForm(initialForm);
      navigation.navigate("SuccessfulPage", {
        service: "Blotter",
      });
    } catch (error) {
      console.log("Error", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDropdownChange = ({ target }) => {
    const { name, value } = target;
    setBlotterForm((prev) => ({
      ...prev,
      [name]: value.value,
    }));
    setTypeErrors(null);
  };

  const handleInputChange = (name, value) => {
    setBlotterForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (name === "subjectname") {
      setSubjectError(!value ? "This field is required!" : null);
    }
    if (name === "details") {
      setDetailsError(!value ? "This field is required!" : null);
    }

    if (
      name === "typeofthecomplaint2" &&
      blotterForm.typeofthecomplaint === "Others"
    ) {
      setTypeErrors2(!value ? "This field is required!" : null);
    }
  };

  const handleSubjectChange = (value) => {
    const matches = residents.filter((res) => {
      const fullName = `${res.firstname} ${
        res.middlename ? res.middlename + " " : ""
      }${res.lastname}`.toLowerCase();
      return fullName.includes(value.toLowerCase());
    });

    setSubjectSuggestions(matches);
    setBlotterForm((prevForm) => ({
      ...prevForm,
      subjectname: value,
      subjectID: "",
      subjectaddress: "",
    }));

    if (blotterForm.subjectname) {
      setSubjectError(!value ? "This field is required!" : null);
    }
  };

  const handleSubjectSuggestionClick = (res) => {
    const fullName = `${res.firstname} ${
      res.middlename ? res.middlename + " " : ""
    }${res.lastname}`;

    setBlotterForm((prevForm) => ({
      ...prevForm,
      subjectID: res._id,
      subjectname: fullName,
      subjectaddress: res.householdno ? res.householdno.address : "N/A",
    }));
    setSubjectError(null);
    setSubjectSuggestions([]);
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

          <Text style={MyStyles.servicesHeader}>Report Blotter</Text>

          <Text style={MyStyles.formMessage}>
            1. Please fill out the required information to file a blotter
            report.
            {"\n"}
            2. Make sure to accurately provide details, including the type of
            incident, the name of the accused, and a clear description of what
            happened. {"\n"}
            3. If you're unsure about any of the information, please
            double-check the details before submitting.
          </Text>
          <View style={MyStyles.servicesContentWrapper}>
            <View>
              <Text style={MyStyles.inputLabel}>
                Type of the Incident<Text style={{ color: "red" }}>*</Text>
              </Text>
              <Dropdown
                labelField="label"
                valueField="value"
                value={blotterForm.typeofthecomplaint}
                data={typeList.map((type) => ({
                  label: type,
                  value: type,
                }))}
                placeholder="Select"
                placeholderStyle={MyStyles.placeholderText}
                selectedTextStyle={MyStyles.selectedText}
                onChange={(itemValue) =>
                  handleDropdownChange({
                    target: { name: "typeofthecomplaint", value: itemValue },
                  })
                }
                style={MyStyles.input}
              ></Dropdown>
              {typeErrors ? (
                <Text style={MyStyles.errorMsg}>{typeErrors}</Text>
              ) : null}
            </View>

            {blotterForm.typeofthecomplaint === "Others" && (
              <View>
                <Text style={MyStyles.inputLabel}>
                  Others (Please Specify)
                  <Text style={{ color: "red" }}>*</Text>
                </Text>
                <TextInput
                  placeholder="Type of the Incident"
                  style={MyStyles.input}
                  value={blotterForm.typeofthecomplaint2}
                  type="text"
                  onChangeText={(text) =>
                    handleInputChange("typeofthecomplaint2", text)
                  }
                />
                {typeErrors2 ? (
                  <Text style={MyStyles.errorMsg}>{typeErrors2}</Text>
                ) : (
                  <View style={{ flex: 1 }} />
                )}
              </View>
            )}

            <View>
              <Text style={MyStyles.inputLabel}>
                Name of the Accused<Text style={{ color: "red" }}>*</Text>
              </Text>
              <TextInput
                placeholder="Name of the Accused"
                style={MyStyles.input}
                value={blotterForm.subjectname}
                type="text"
                onChangeText={handleSubjectChange}
                autoComplete="off"
              />
              {blotterForm.subjectname?.length > 0 &&
                subjectSuggestions?.length > 0 && (
                  <View style={MyStyles.suggestionContainer}>
                    <ScrollView style={{ maxHeight: 200 }}>
                      {/* Make this scrollable */}
                      {subjectSuggestions.map((res) => {
                        const fullName = `${res.firstname} ${
                          res.middlename ? res.middlename + " " : ""
                        }${res.lastname}`;
                        return (
                          <TouchableOpacity
                            key={res._id}
                            onPress={() => handleSubjectSuggestionClick(res)}
                            style={MyStyles.suggestionItem}
                          >
                            <Text style={MyStyles.blotterFullName}>
                              {fullName}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                  </View>
                )}

              {subjectError ? (
                <Text style={MyStyles.errorMsg}>{subjectError}</Text>
              ) : null}
            </View>

            <View>
              <Text style={MyStyles.inputLabel}>Address of the Accused</Text>
              <TextInput
                placeholder="Address of the Accused"
                style={MyStyles.input}
                value={blotterForm.subjectaddress}
                editable={!blotterForm.subjectID}
                type="text"
                onChangeText={(text) =>
                  handleInputChange("subjectaddress", text)
                }
              />
            </View>

            <View>
              <Text style={MyStyles.inputLabel}>
                Details of the Incident<Text style={{ color: "red" }}>*</Text>
              </Text>
              <TextInput
                placeholder="Details of the Incident"
                style={[
                  MyStyles.input,
                  { height: 200, textAlignVertical: "top" },
                ]}
                value={blotterForm.details}
                type="text"
                multiline={true}
                numberOfLines={4}
                maxLength={3000}
                autoCapitalize="sentences"
                onChangeText={(text) => handleInputChange("details", text)}
              />

              <View style={MyStyles.errorDetailsWrapper}>
                {detailsError ? (
                  <Text style={MyStyles.errorMsg}>{detailsError}</Text>
                ) : (
                  <View style={{ flex: 1 }} />
                )}

                <Text style={MyStyles.detailsLength}>
                  {blotterForm.details.length}/3000
                </Text>
              </View>
            </View>
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
            isVisible={isConfirmModalVisible}
            isConfirmationModal={true}
            title="Report a Blotter?"
            message="Are you sure you want to file a blotter?"
            onClose={() => setIsConfirmModalVisible(false)}
            onConfirm={handleSubmit}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Blotter;
