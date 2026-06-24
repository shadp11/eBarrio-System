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
import { useContext, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from "../context/AuthContext";
import { Dropdown } from "react-native-element-dropdown";
import api from "../api";
import { MyStyles } from "./stylesheet/MyStyles";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AlertModal from "./AlertModal";

//ICONS
import { MaterialIcons } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";

const Certificates = () => {
  const insets = useSafeAreaInsets();
  const { user } = useContext(AuthContext);
  const navigation = useNavigation();
  const [typeErrors, setTypeErrors] = useState(null);
  const [purposeError, setPurposeError] = useState(null);
  const [purposeError2, setPurposeError2] = useState(null);
  const [streetError, setStreetError] = useState(null);
  const [busNameError, setBusNameError] = useState(null);
  const [lineBusError, setLineBusError] = useState(null);
  const initialForm = {
    typeofcertificate: "",
    amount: "₱0.00",
    purpose: "",
    purpose2: "",
    businessname: "",
    lineofbusiness: "",
    addressnumber: "",
    street: "",
    locationofbusiness: "",
  };
  const [certificateForm, setCertificateForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);

  const certificates = [
    { name: "Barangay Indigency", price: "₱10.00" },
    { name: "Barangay Clearance", price: "₱10.00" },
    { name: "Barangay Business Clearance", price: "₱30.00" },
  ];

  const streetList = [
    "Zapote-Molino Road",
    "1st Street",
    "2nd Street",
    "3rd Street",
    "4th Street",
    "5th Street",
    "6th Street",
    "8th Street",
    "8th Street Exnt",
    "5th Street Exnt",
    "Dominga Rivera Street",
    "Tabing-Ilog Street",
    "Arko",
    "9th Street",
    "10th Street",
    "11th Street",
    "My Address",
  ];

  const purpose = ["ALS Requirement", "Financial Assistance", "Others"];

  const certificateFields = {
    "Barangay Indigency": [
      "typeofcertificate",
      "purpose",
      "purpose2",
      "amount",
    ],
    "Barangay Clearance": [
      "typeofcertificate",
      "purpose",
      "purpose2",
      "amount",
    ],
    "Barangay Business Clearance": [
      "typeofcertificate",
      "addressnumber",
      "street",
      "businessname",
      "lineofbusiness",
      "amount",
    ],
  };

  const handleConfirm = () => {
    if (!certificateForm.typeofcertificate) {
      setTypeErrors("This field is required!");
      return;
    } else {
      setTypeErrors(null);

      if (
        certificateForm.typeofcertificate === "Barangay Indigency" ||
        certificateForm.typeofcertificate === "Barangay Clearance"
      ) {
        if (!certificateForm.purpose) {
          setPurposeError("This field is required!");
          return;
        } else {
          setPurposeError(null);
        }
        if (certificateForm.purpose === "Others" && !certificateForm.purpose2) {
          setPurposeError2("This field is required!");
          return;
        } else {
          setPurposeError2(null);
        }
      } else if (
        certificateForm.typeofcertificate === "Barangay Business Clearance"
      ) {
        let hasError = false;

        if (!certificateForm.street) {
          setStreetError("This field is required!");
          hasError = true;
        } else {
          setStreetError(null);
        }

        if (!certificateForm.businessname) {
          setBusNameError("This field is required!");
          hasError = true;
        } else {
          setBusNameError(null);
        }

        if (!certificateForm.lineofbusiness) {
          setLineBusError("This field is required!");
          hasError = true;
        } else {
          setLineBusError(null);
        }

        if (hasError) return;
      }
    }

    setIsConfirmModalVisible(true);
  };

  const handleSubmit = async () => {
    setIsConfirmModalVisible(false);
    if (loading) return;

    setLoading(true);
    const requiredFields =
      certificateFields[certificateForm.typeofcertificate] || [];

    const filteredData = requiredFields.reduce((obj, key) => {
      if (certificateForm[key] !== undefined) {
        obj[key] = certificateForm[key];
      }
      return obj;
    }, {});

    if (
      certificateForm.typeofcertificate === "Barangay Business Clearance" &&
      certificateForm.street
    ) {
      const fullAddress = certificateForm.addressnumber
        ? `${certificateForm.addressnumber} ${certificateForm.street} Aniban 2, Bacoor, Cavite`
        : `${certificateForm.street} Aniban 2, Bacoor, Cavite`;

      filteredData.locationofbusiness = fullAddress;
      delete filteredData.addressnumber;
      delete filteredData.street;
    }

    if (
      certificateForm.typeofcertificate === "Barangay Business Clearance" &&
      certificateForm.street === "My Address"
    ) {
      filteredData.locationofbusiness = "Resident's Address";
      delete filteredData.addressnumber;
      delete filteredData.street;
    }

    if (filteredData.purpose === "Others") {
      filteredData.purpose = filteredData.purpose2;
      delete filteredData.purpose2;
    } else {
      delete filteredData.purpose2;
    }

    console.log(filteredData);

    try {
      await api.post("/sendcertrequest", {
        filteredData,
        userID: user.userID,
      });

      navigation.navigate("SuccessfulPage", {
        service: "Document",
      });
    } catch (error) {
      console.log("Error", error);
    } finally {
      setLoading(false);
    }
  };
  console.log(certificateForm);

  const handleDropdownChange = ({ target }) => {
    const { name, value } = target;
    if (name === "typeofcertificate") {
      const selectedCert = certificates.find(
        (cert) => cert.name === value.value
      );
      setCertificateForm((prev) => ({
        ...prev,
        [name]: value.value,
        amount: selectedCert ? selectedCert.price : "₱0.00",
      }));
      setTypeErrors(null);
    } else {
      setCertificateForm((prev) => ({
        ...prev,
        [name]: value.value,
      }));
      setPurposeError(null);
      setStreetError(null);
    }
  };

  const handleInputChange = (name, value) => {
    setCertificateForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (name === "businessname") {
      setBusNameError(!value ? "This field is required!" : null);
    }
    if (name === "lineofbusiness") {
      setLineBusError(!value ? "This field is required!" : null);
    }
    if (certificateForm.purpose === "Others" && name === "purpose2") {
      setPurposeError2(!value ? "This field is required!" : null);
    }
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
              padding: 30,
            },
          ]}
        >
          <AntDesign
            onPress={() => navigation.navigate("BottomTabs")}
            name="arrowleft"
            style={MyStyles.backArrow}
          />

          <Text style={MyStyles.servicesHeader}>Request Document</Text>

          <Text style={MyStyles.formMessage}>
            1. Please fill out the required information to request a document.
            {"\n"}
            2. Make sure to accurately provide details for each type of
            document. {"\n"}
          </Text>

          <View style={MyStyles.servicesContentWrapper}>
            <View>
              <Text style={MyStyles.inputLabel}>
                Type of Document<Text style={{ color: "red" }}>*</Text>
              </Text>
              <Dropdown
                labelField="label"
                valueField="value"
                value={certificateForm.typeofcertificate}
                data={certificates.map((cert) => ({
                  label: cert.name,
                  value: cert.name,
                }))}
                placeholder="Select"
                placeholderStyle={MyStyles.placeholderText}
                selectedTextStyle={MyStyles.selectedText}
                onChange={(itemValue) =>
                  handleDropdownChange({
                    target: { name: "typeofcertificate", value: itemValue },
                  })
                }
                style={MyStyles.input}
              ></Dropdown>
              {typeErrors ? (
                <Text style={MyStyles.errorMsg}>{typeErrors}</Text>
              ) : null}
            </View>

            {["Barangay Indigency", "Barangay Clearance"].includes(
              certificateForm.typeofcertificate
            ) && (
              <>
                <View>
                  <Text style={MyStyles.inputLabel}>
                    Purpose<Text style={{ color: "red" }}>*</Text>
                  </Text>
                  <Dropdown
                    labelField="label"
                    valueField="value"
                    value={certificateForm.purpose}
                    data={purpose.map((purp) => ({
                      label: purp,
                      value: purp,
                    }))}
                    placeholder="Select"
                    placeholderStyle={MyStyles.placeholderText}
                    selectedTextStyle={MyStyles.selectedText}
                    onChange={(itemValue) =>
                      handleDropdownChange({
                        target: { name: "purpose", value: itemValue },
                      })
                    }
                    style={MyStyles.input}
                  ></Dropdown>
                  {purposeError ? (
                    <Text style={MyStyles.errorMsg}>{purposeError}</Text>
                  ) : null}
                </View>
                {certificateForm.purpose === "Others" && (
                  <View>
                    <Text style={MyStyles.inputLabel}>
                      Others (Please Specify)
                      <Text style={{ color: "red" }}>*</Text>
                    </Text>
                    <TextInput
                      placeholder="Purpose"
                      style={MyStyles.input}
                      value={certificateForm.purpose2}
                      type="text"
                      onChangeText={(text) =>
                        handleInputChange("purpose2", text)
                      }
                    />
                    {purposeError2 ? (
                      <Text style={MyStyles.errorMsg}>{purposeError2}</Text>
                    ) : (
                      <View style={{ flex: 1 }} />
                    )}
                  </View>
                )}
              </>
            )}

            {certificateForm.typeofcertificate ===
              "Barangay Business Clearance" && (
              <>
                <View>
                  <Text style={MyStyles.inputLabel}>
                    Street<Text style={{ color: "red" }}>*</Text>
                  </Text>
                  <Dropdown
                    labelField="label"
                    valueField="value"
                    value={certificateForm.street}
                    data={streetList.map((street) => ({
                      label: street,
                      value: street,
                    }))}
                    placeholder="Select"
                    placeholderStyle={MyStyles.placeholderText}
                    selectedTextStyle={MyStyles.selectedText}
                    onChange={(itemValue) =>
                      handleDropdownChange({
                        target: { name: "street", value: itemValue },
                      })
                    }
                    style={MyStyles.input}
                  ></Dropdown>
                  {streetError ? (
                    <Text style={MyStyles.errorMsg}>{streetError}</Text>
                  ) : null}
                </View>

                {certificateForm.street &&
                  certificateForm.street !== "My Address" && (
                    <>
                      <View>
                        <Text style={MyStyles.inputLabel}>Address Number</Text>
                        <TextInput
                          placeholder="Address Number"
                          placeholderStyle={MyStyles.placeholderText}
                          selectedTextStyle={MyStyles.selectedText}
                          onChangeText={(text) =>
                            handleInputChange("addressnumber", text)
                          }
                          style={MyStyles.input}
                        />
                      </View>
                    </>
                  )}
                <View>
                  <Text style={MyStyles.inputLabel}>
                    Business Name<Text style={{ color: "red" }}>*</Text>
                  </Text>
                  <TextInput
                    placeholder="Business Name"
                    placeholderStyle={MyStyles.placeholderText}
                    selectedTextStyle={MyStyles.selectedText}
                    onChangeText={(text) =>
                      handleInputChange("businessname", text)
                    }
                    style={MyStyles.input}
                    value={certificateForm.businessname}
                  />
                  {busNameError ? (
                    <Text style={MyStyles.errorMsg}>{busNameError}</Text>
                  ) : null}
                </View>
                <View>
                  <Text style={MyStyles.inputLabel}>
                    Line of Business<Text style={{ color: "red" }}>*</Text>
                  </Text>
                  <TextInput
                    placeholder="Line of Business"
                    placeholderStyle={MyStyles.placeholderText}
                    selectedTextStyle={MyStyles.selectedText}
                    onChangeText={(text) =>
                      handleInputChange("lineofbusiness", text)
                    }
                    style={MyStyles.input}
                    value={certificateForm.lineofbusiness}
                  />
                  {lineBusError ? (
                    <Text style={MyStyles.errorMsg}>{lineBusError}</Text>
                  ) : null}
                </View>
              </>
            )}

            <View>
              <Text style={MyStyles.inputLabel}>Amount</Text>
              <TextInput
                value={certificateForm.amount}
                editable={false} // Keeps the amount field non-editable
                style={MyStyles.blotterFullName}
              />
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
            title="Request a Document?"
            message="Are you sure you want to request a document?"
            onClose={() => setIsConfirmModalVisible(false)}
            onConfirm={handleSubmit}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Certificates;
