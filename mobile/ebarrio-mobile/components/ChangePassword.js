import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { MyStyles } from "./stylesheet/MyStyles";
import { AuthContext } from "../context/AuthContext";
import { useContext, useState } from "react";
import api from "../api";
import AlertModal from "./AlertModal";

//ICONS
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";

const ChangePassword = () => {
  const { logout } = useContext(AuthContext);
  const [password, setPassword] = useState("");
  const [newpassword, setNewPassword] = useState("");
  const [renewpassword, setRenewPassword] = useState("");
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [passError, setPassError] = useState("");
  const [passwordErrors, setPasswordErrors] = useState([]);
  const [repasswordErrors, setRePasswordErrors] = useState([]);
  const [secureCurrPass, setSecureCurrPass] = useState(true);
  const [secureNewPass, setSecureNewPass] = useState(true);
  const [secureConfirmPass, setSecureConfirmPass] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
  const [isAlertModalVisible, setIsAlertModalVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const togglesecureCurrPass = () => {
    setSecureCurrPass(!secureCurrPass);
  };

  const togglesecureNewPass = () => {
    setSecureNewPass(!secureNewPass);
  };

  const togglesecureConfirmPass = () => {
    setSecureConfirmPass(!secureConfirmPass);
  };

  const passwordValidation = (val) => {
    let errors = [];
    let errors2 = [];
    let formattedVal = val.replace(/\s+/g, "");

    setNewPassword(formattedVal);
    if (!formattedVal) {
      errors.push("This field is required!");
    }
    if (
      (formattedVal && formattedVal.length < 8) ||
      (formattedVal && formattedVal.length > 64)
    ) {
      errors.push("Password must be between 8 and 64 characters only!");
    }
    if (formattedVal && !/^[a-zA-Z0-9!@\$%\^&*\+#]+$/.test(formattedVal)) {
      errors.push(
        "Password can only contain letters, numbers, and !, @, $, %, ^, &, *, +, #"
      );
    }
    if (renewpassword && formattedVal !== renewpassword) {
      errors2.push("Passwords do not match!");
    }

    setPasswordErrors(errors);
    setRePasswordErrors(errors2);
  };

  const repasswordValidation = (val) => {
    let errors = [];
    let formattedVal = val.replace(/\s+/g, "");
    setRenewPassword(formattedVal);

    if (!formattedVal) {
      errors.push("This field is required!");
    }
    if (formattedVal !== newpassword && formattedVal.length > 0) {
      errors.push("Passwords do not match!");
    }
    setRePasswordErrors(errors);
  };

  const handlePassChange = (input) => {
    if (input.length === 0) {
      setPassError("This field is required!");
    } else {
      setPassError("");
    }
    setPassword(input);
  };

  const handleConfirm = async () => {
    let hasErrors = false;
    if (!newpassword) {
      passwordValidation(newpassword);
      hasErrors = true;
    }

    if (!renewpassword) {
      repasswordValidation(renewpassword);
      hasErrors = true;
    }

    if (!password) {
      setPassError("This field is required!");
      hasErrors = true;
    } else {
      setPassError("");
    }

    if (passwordErrors.length !== 0) {
      hasErrors = true;
    }

    if (repasswordErrors.length !== 0) {
      hasErrors = true;
    }

    if (hasErrors) {
      return;
    }

    setIsConfirmModalVisible(true);
  };

  const handlePasswordChange = async () => {
    setIsConfirmModalVisible(false);
    if (loading) return;

    setLoading(true);
    try {
      await api.put("/changepassword", {
        newpassword,
        password,
      });
      setIsSuccess(true);
      setAlertMessage("Your password has been updated. Please log in again.");
    } catch (error) {
      const response = error.response;
      if (response && response.data) {
        console.log("❌ Error status:", response.status);
        setAlertMessage(response.data.message || "Something went wrong.");
      } else {
        console.log("❌ Network or unknown error:", error.message);
        setAlertMessage("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
      setIsAlertModalVisible(true);
      setAlertMessage(message);
      setIsSuccess(false);
    }
  };

  const handleCloseAlertModal = () => {
    setIsAlertModalVisible(false);
    setPassword("");
    setNewPassword("");
    setRenewPassword("");

    if (isSuccess) {
      logout();
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
      <ScrollView
        contentContainerStyle={[
          MyStyles.scrollContainer,
          {
            gap: 10,
          },
        ]}
      >
        <AntDesign
          onPress={() => navigation.navigate("AccountSettings")}
          name="arrowleft"
          style={MyStyles.backArrow}
        />

        <Text style={[MyStyles.servicesHeader, { marginTop: 0 }]}>
          Change Password
        </Text>

        <View style={MyStyles.servicesContentWrapper}>
          <View>
            <Text style={MyStyles.inputLabel}>
              Current Password
              <Text style={MyStyles.redAsterisk}>*</Text>
            </Text>
            <View style={MyStyles.eyeInputContainer}>
              <TextInput
                onChangeText={handlePassChange}
                value={password}
                secureTextEntry={secureCurrPass}
                placeholder="Current Password"
                style={[MyStyles.input, { paddingRight: 40 }]}
              />
              <TouchableOpacity
                style={MyStyles.eyeToggle}
                onPress={togglesecureCurrPass}
              >
                <Ionicons
                  name={secureCurrPass ? "eye-off" : "eye"}
                  size={24}
                  color="gray"
                />
              </TouchableOpacity>
            </View>
            {passError ? (
              <Text style={MyStyles.errorMsg}>{passError}</Text>
            ) : null}
          </View>

          <View>
            <Text style={MyStyles.inputLabel}>
              New Password<Text style={MyStyles.redAsterisk}>*</Text>
            </Text>
            <View style={MyStyles.eyeInputContainer}>
              <TextInput
                onChangeText={passwordValidation}
                value={newpassword}
                secureTextEntry={secureNewPass}
                placeholder="New Password"
                style={[MyStyles.input, { paddingRight: 40 }]}
              />
              <TouchableOpacity
                style={MyStyles.eyeToggle}
                onPress={togglesecureNewPass}
              >
                <Ionicons
                  name={secureNewPass ? "eye-off" : "eye"}
                  size={24}
                  color="gray"
                />
              </TouchableOpacity>
            </View>
            {passwordErrors.length > 0 && (
              <View style={{ marginTop: 5, width: "100%" }}>
                {passwordErrors.map((error, index) => (
                  <Text key={index} style={MyStyles.errorMsg}>
                    {error}
                  </Text>
                ))}
              </View>
            )}
          </View>

          <View>
            <Text style={MyStyles.inputLabel}>
              Confirm New Password
              <Text style={MyStyles.redAsterisk}>*</Text>
            </Text>
            <View style={MyStyles.eyeInputContainer}>
              <TextInput
                onChangeText={repasswordValidation}
                value={renewpassword}
                secureTextEntry={secureConfirmPass}
                placeholder="Confirm New Password"
                style={[MyStyles.input, { paddingRight: 40 }]}
              />
              <TouchableOpacity
                style={MyStyles.eyeToggle}
                onPress={togglesecureConfirmPass}
              >
                <Ionicons
                  name={secureConfirmPass ? "eye-off" : "eye"}
                  size={24}
                  color="gray"
                />
              </TouchableOpacity>
              {repasswordErrors.length > 0 && (
                <View>
                  {repasswordErrors.map((error, index) => (
                    <Text key={index} style={MyStyles.errorMsg}>
                      {error}
                    </Text>
                  ))}
                </View>
              )}
            </View>
          </View>
        </View>
        <TouchableOpacity
          onPress={handleConfirm}
          style={[MyStyles.button, { marginTop: 30 }]}
          disabled={loading}
        >
          <Text style={MyStyles.buttonText}>
            {loading ? "Updating..." : "Update"}
          </Text>
        </TouchableOpacity>

        <AlertModal
          isVisible={isAlertModalVisible}
          message={alertMessage}
          isSuccess={isSuccess}
          onClose={handleCloseAlertModal}
          onConfirm={handleCloseAlertModal}
        />

        <AlertModal
          isVisible={isConfirmModalVisible}
          isConfirmationModal={true}
          title="Change Password?"
          message="Are you sure you want to change your password? This action cannot be undone."
          onClose={() => setIsConfirmModalVisible(false)}
          onConfirm={handlePasswordChange}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default ChangePassword;
