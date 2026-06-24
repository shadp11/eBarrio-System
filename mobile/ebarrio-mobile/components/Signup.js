import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { MyStyles } from "./stylesheet/MyStyles";
import { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { useContext } from "react";
import { OtpContext } from "../context/OtpContext";
import api from "../api";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AppLogo from "..//assets/applogo-darkbg.png";
import AlertModal from "./AlertModal";
import { LinearGradient } from "expo-linear-gradient";
import { RFPercentage } from "react-native-responsive-fontsize";

//ICONS
import Ionicons from "@expo/vector-icons/Ionicons";

const Signup = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { sendOTP } = useContext(OtpContext);
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [mobilenumber, setMobileNumber] = useState("+63");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [repassword, setRePassword] = useState("");
  const [fnameError, setFnameError] = useState(null);
  const [lnameError, setLnameError] = useState(null);
  const [usernameErrors, setUsernameErrors] = useState([]);
  const [passwordErrors, setPasswordErrors] = useState([]);
  const [mobilenumErrors, setMobileNumErrors] = useState([]);
  const [repasswordErrors, setRePasswordErrors] = useState([]);
  const [secureNewPass, setSecureNewPass] = useState(true);
  const [secureConfirmPass, setSecureConfirmPass] = useState(true);
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
  const [isAlertModalVisible, setIsAlertModalVisible] = useState(false);
  const [isAlreadyExistsModalVisible, setIsAlreadyExistsModalVisible] =
    useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const togglesecureNewPass = () => {
    setSecureNewPass(!secureNewPass);
  };

  const togglesecureConfirmPass = () => {
    setSecureConfirmPass(!secureConfirmPass);
  };

  const firstnameValidation = (val) => {
    setFirstname(val);
    if (!val) {
      setFnameError("This field is required!");
    } else {
      setFnameError(null);
    }
  };

  const lastnameValidation = (val) => {
    setLastname(val);
    if (!val) {
      setLnameError("This field is required!");
    } else {
      setLnameError(null);
    }
  };

  const usernameValidation = (val) => {
    let errors = [];
    let formattedVal = val.replace(/\s+/g, "");
    setUsername(formattedVal);

    if (!formattedVal) {
      errors.push("This field is required!");
    }
    if (
      (formattedVal && formattedVal.length < 3) ||
      (formattedVal && formattedVal.length > 16)
    ) {
      errors.push("Username must be between 3 and 16 characters only.");
    }
    if (formattedVal && !/^[a-zA-Z0-9_]+$/.test(formattedVal)) {
      errors.push(
        "Username can only contain letters, numbers, and underscores."
      );
    }
    if (
      (formattedVal && formattedVal.startsWith("_")) ||
      (formattedVal && formattedVal.endsWith("_"))
    ) {
      errors.push("Username must not start or end with an underscore.");
    }

    setUsernameErrors(errors);
  };

  const repasswordValidation = (val) => {
    let errors = [];
    let formattedVal = val.replace(/\s+/g, "");
    setRePassword(formattedVal);

    if (!formattedVal) {
      errors.push("This field is required!");
    }
    if (formattedVal !== password && formattedVal.length > 0) {
      errors.push("Passwords do not match!");
    }
    setRePasswordErrors(errors);
  };

  const mobileInputChange = (val) => {
    let errors = [];

    if (val.startsWith("+")) {
      val = "+" + val.slice(1).replace(/\D/g, "");
    } else {
      val = val.replace(/\D/g, "");
    }

    if (!val.startsWith("+63")) {
      val = "+63" + val.replace(/^0+/, "").slice(2);
    }

    if (val.length > 13) {
      val = val.slice(0, 13);
    }

    if (val.length >= 4 && val[3] === "0") {
      return;
    }

    if (val.length < 13) {
      errors.push("Invalid mobile number!");
    }

    setMobileNumber(val);
    setMobileNumErrors(errors);
  };

  const passwordValidation = (val) => {
    let errors = [];
    let errors2 = [];
    let formattedVal = val.replace(/\s+/g, "");
    setPassword(formattedVal);

    if (!formattedVal) {
      errors.push("This field is required!");
    }
    if (formattedVal && (formattedVal.length < 8 || formattedVal.length > 64)) {
      errors.push("Password must be between 8 and 64 characters only!");
    }
    if (formattedVal && !/^[a-zA-Z0-9!@\$%\^&*\+#]+$/.test(formattedVal)) {
      errors.push(
        "Password can only contain letters, numbers, and !, @, $, %, ^, &, *, +, #"
      );
    }
    if (repassword && formattedVal !== repassword) {
      errors2.push("Passwords do not match!");
    }
    setPasswordErrors(errors);
    setRePasswordErrors(errors2);
  };

  const handleSignUp = async () => {
    if (
      !firstname ||
      !lastname ||
      !username ||
      !password ||
      !repassword ||
      !mobilenumber
    ) {
      firstnameValidation(firstname);
      lastnameValidation(lastname);
      usernameValidation(username);
      mobileInputChange(mobilenumber);
      passwordValidation(password);
      repasswordValidation(repassword);
      return;
    }

    if (usernameErrors.length !== 0) {
      return;
    }
    if (passwordErrors.length !== 0) {
      return;
    }
    if (repasswordErrors.length !== 0) {
      return;
    }
    if (mobilenumErrors.length !== 0) {
      return;
    }

    setIsConfirmModalVisible(true);
  };

  const handleSubmit = async () => {
    setIsConfirmModalVisible(false);
    try {
      let formattedNumber = mobilenumber;
      formattedNumber = "0" + mobilenumber.slice(3);
      const response = await api.post("/checkresident", {
        username,
        firstname,
        lastname,
        mobilenumber: formattedNumber,
      });
      try {
        sendOTP(username, formattedNumber);
        navigation.navigate("OTP", {
          username: username,
          password: password,
          mobilenumber: formattedNumber,
          resID: response.data.resID,
          navigatelink: "Login",
        });
      } catch (error) {
        const response = error.response;
        if (response && response.data) {
          console.log("❌ Error status:", response.status);
          setAlertMessage(response.data.message || "Something went wrong.");
          setIsAlertModalVisible(true);
        } else {
          console.log("❌ Network or unknown error:", error.message);
          setAlertMessage("An unexpected error occurred.");
          setIsAlertModalVisible(true);
        }
      }
    } catch (error) {
      const response = error.response;
      if (response && response.data) {
        if (
          response.status === 404 &&
          response.data.message === "Resident not found"
        ) {
          setAlertMessage(
            "Would you like to register your resident profile now?"
          );
          setIsAlertModalVisible(true);
        } else {
          setAlertMessage(response.data.message || "Something went wrong.");
          setIsAlreadyExistsModalVisible(true);
        }
      } else {
        console.log("❌ Network or unknown error:", error.message);
        setAlertMessage("An unexpected error occurred.");
        setIsAlertModalVisible(true);
      }
    }
  };

  const onResidentModalConfirm = () => {
    setIsAlertModalVisible(false);
    navigation.navigate("ResidentForm");
    setFirstname("");
    setLastname("");
    setMobileNumber("");
    setUsername("");
    setPassword("");
    setRePassword("");
  };

  return (
    <LinearGradient
      colors={["#0e94d3", "#0a70a0", "#095e86", "#074c6d"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={{ flex: 1 }}
    >
      <SafeAreaView
        style={{
          flex: 1,
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
          backgroundColor: "transparent",
        }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <View style={MyStyles.loginWrapper}>
            <View style={MyStyles.loginTopWrapper}>
              <Image source={AppLogo} style={MyStyles.loginLogo} />
            </View>

            <View style={MyStyles.loginBottomWrapper}>
              <ScrollView
                style={{ width: "100%", marginBottom: 40 }}
                contentContainerStyle={{
                  alignItems: "center",
                }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                <Text style={[MyStyles.header, { alignSelf: "flex-start" }]}>
                  Create Account
                </Text>
                <Text style={MyStyles.forgotMsg}>
                  Please enter your details to create an account.
                </Text>

                <View style={MyStyles.loginFormWrapper}>
                  <View>
                    <Text style={MyStyles.inputLabel}>
                      First Name<Text style={{ color: "red" }}>*</Text>
                    </Text>
                    <TextInput
                      style={MyStyles.input}
                      placeholder="First name"
                      value={firstname}
                      onChangeText={firstnameValidation}
                    />
                    {fnameError ? (
                      <Text style={MyStyles.errorMsg}>{fnameError}</Text>
                    ) : null}
                  </View>

                  <View>
                    <Text style={MyStyles.inputLabel}>
                      Last Name<Text style={{ color: "red" }}>*</Text>
                    </Text>
                    <TextInput
                      style={MyStyles.input}
                      placeholder="Last name"
                      value={lastname}
                      onChangeText={lastnameValidation}
                    />
                    {lnameError ? (
                      <Text style={MyStyles.errorMsg}>{lnameError}</Text>
                    ) : null}
                  </View>

                  <View>
                    <Text style={MyStyles.inputLabel}>
                      Mobile Number<Text style={{ color: "red" }}>*</Text>
                    </Text>
                    <TextInput
                      style={MyStyles.input}
                      placeholder="Mobile Number"
                      value={mobilenumber}
                      keyboardType="numeric"
                      onChangeText={mobileInputChange}
                    />
                    {mobilenumErrors.length > 0 && (
                      <View>
                        {mobilenumErrors.map((error, index) => (
                          <Text key={index} style={MyStyles.errorMsg}>
                            {error}
                          </Text>
                        ))}
                      </View>
                    )}
                  </View>

                  <View>
                    <Text style={MyStyles.inputLabel}>
                      Username<Text style={{ color: "red" }}>*</Text>
                    </Text>
                    <TextInput
                      style={MyStyles.input}
                      placeholder="Username"
                      value={username}
                      autoCapitalize="none"
                      onChangeText={usernameValidation}
                      onBlur={() => setUsername(username.toLowerCase())}
                    />
                    {usernameErrors.length > 0 && (
                      <View>
                        {usernameErrors.map((error, index) => (
                          <Text key={index} style={MyStyles.errorMsg}>
                            {error}
                          </Text>
                        ))}
                      </View>
                    )}
                  </View>

                  <View>
                    <Text style={MyStyles.inputLabel}>
                      Password<Text style={{ color: "red" }}>*</Text>
                    </Text>
                    <View style={{ position: "relative" }}>
                      <TextInput
                        value={password}
                        onChangeText={passwordValidation}
                        secureTextEntry={secureNewPass}
                        placeholder="Password"
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
                      <View>
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
                      Confirm Password<Text style={{ color: "red" }}>*</Text>
                    </Text>
                    <View style={{ position: "relative" }}>
                      <TextInput
                        value={repassword}
                        onChangeText={repasswordValidation}
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
                    </View>
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

                  <View>
                    <Text
                      style={[
                        MyStyles.byClickingText,
                        {
                          textAlign: "justify",
                          fontSize: RFPercentage(1.8),
                          opacity: 0.8,
                        },
                      ]}
                    >
                      By clicking Sign Up, you agree to eBarrio’s{" "}
                      <Text
                        onPress={() => navigation.navigate("TermsConditions")}
                        style={[
                          MyStyles.signUpText,
                          { fontSize: RFPercentage(1.8) },
                        ]}
                      >
                        Terms and Conditions
                      </Text>
                      <Text> & </Text>
                      <Text
                        onPress={() => navigation.navigate("DataPrivacy")}
                        style={[
                          MyStyles.signUpText,
                          { fontSize: RFPercentage(1.8) },
                        ]}
                      >
                        Data Privacy
                      </Text>
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={handleSignUp}
                  style={MyStyles.button}
                >
                  <Text style={MyStyles.buttonText}>Sign up</Text>
                </TouchableOpacity>

                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    width: "100%",
                    gap: 4,
                    marginTop: 10,
                  }}
                >
                  <Text
                    onPress={() => navigation.navigate("ResidentForm")}
                    style={[
                      MyStyles.signUpText,
                      { textDecorationLine: "underline" },
                    ]}
                  >
                    {" "}
                    No Resident Profile?
                  </Text>

                  <Text
                    onPress={() => navigation.navigate("Login")}
                    style={[
                      MyStyles.signUpText,
                      { textDecorationLine: "underline" },
                    ]}
                  >
                    Login
                  </Text>
                </View>
              </ScrollView>
            </View>

            <AlertModal
              isVisible={isAlertModalVisible}
              message={alertMessage}
              title="Resident Not Found"
              onClose={() => setIsAlertModalVisible(false)}
              onConfirm={onResidentModalConfirm}
              isResidentConfirmationModal={
                alertMessage ===
                "Would you like to register your resident profile now?"
              }
              isSuccess={false}
            />

            <AlertModal
              isVisible={isAlreadyExistsModalVisible}
              message={alertMessage}
              title="Error"
              onClose={() => setIsAlreadyExistsModalVisible(false)}
              isHaveAnAccountModal={alertMessage === "Account Already Exists"}
              isSuccess={false}
            />

            <AlertModal
              isVisible={isConfirmModalVisible}
              isConfirmationModal={true}
              title="Create Account?"
              message="Are you sure you want to create account?"
              onClose={() => setIsConfirmModalVisible(false)}
              onConfirm={handleSubmit}
            />
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};
export default Signup;
