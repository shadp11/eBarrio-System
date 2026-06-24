import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { MyStyles } from "./stylesheet/MyStyles";
import { useContext, useEffect, useRef, useState } from "react";
import { OtpContext } from "../context/OtpContext";
import { OtpInput } from "react-native-otp-entry";
import { Dropdown } from "react-native-element-dropdown";
import api from "../api";
import AppLogo from "..//assets/applogo-darkbg.png";
import Svg, { Defs, RadialGradient, Stop, Rect } from "react-native-svg";
import AlertModal from "./AlertModal";
import { AntDesign } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

//ICONS
import { MaterialIcons } from "@expo/vector-icons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Ionicons from "@expo/vector-icons/Ionicons";

const ForgotPassword = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [username, setUsername] = useState("");
  const [user, setUser] = useState([]);
  const { sendOTP, verifyOTP } = useContext(OtpContext);
  const [resendTimer, setResendTimer] = useState(30);
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const [resendCount, setResendCount] = useState(0);
  const [isExisting, setIsExisting] = useState(false);
  const [isOTPClicked, setOTPClicked] = useState(false);
  const otpRef = useRef(null);
  const [isQuestionsClicked, setQuestionsClicked] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [renewPassword, setReNewPassword] = useState("");
  const [passwordErrors, setPasswordErrors] = useState([]);
  const [repasswordErrors, setRePasswordErrors] = useState([]);
  const [OTP, setOTP] = useState("");
  const [securityquestion, setSecurityQuestion] = useState({
    question: "",
    answer: "",
  });

  const [loading, setLoading] = useState(false);
  const [secureNewPass, setsecureNewPass] = useState(true);
  const [secureConfirmPass, setsecureConfirmPass] = useState(true);
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
  const [isAlertModalVisible, setIsAlertModalVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [secureAnswer, setsecureAnswer] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);

  // Toggle Password Visibility in Reset Password
  const togglesecureNewPass = () => {
    setsecureNewPass(!secureNewPass);
  };

  const togglesecureConfirmPass = () => {
    setsecureConfirmPass(!secureConfirmPass);
  };

  const handleInputChange = (field, value) => {
    const updatedValue = field === "answer" ? value.toLowerCase() : value;
    setSecurityQuestion((prev) => ({
      ...prev,
      [field]: updatedValue,
    }));
  };

  const handleSubmit = async () => {
    if (loading) return;

    if (!username || username.trim() === "") {
      setAlertMessage("Kindly enter your username.");
      setIsAlertModalVisible(true);
      return;
    }

    setLoading(true);
    try {
      const response = await api.get(`/checkuser/${username}`);
      setIsExisting(true);
      setUser(response.data);
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
    } finally {
      setLoading(false);
    }
    setIsConfirmModalVisible(false);
  };

  const handleQuestionVerify = async () => {
    if (loading) return;

    if (
      !securityquestion.question ||
      securityquestion.question.trim() === "Select"
    ) {
      if (!securityquestion.answer || securityquestion.answer.trim() === "") {
        setAlertMessage(
          "Both fields need to be filled before proceeding to reset your password."
        );
        setIsAlertModalVisible(true);
        return;
      }

      setAlertMessage("Kindly choose a security question to continue.");
      setIsAlertModalVisible(true);
      return;
    }

    if (!securityquestion.answer || securityquestion.answer.trim() === "") {
      setAlertMessage("Kindly enter your answer.");
      setIsAlertModalVisible(true);
      return;
    }

    setLoading(true);
    try {
      await api.post(`/verifyquestion/${username}`, { securityquestion });
      setIsVerified(true);
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
    } finally {
      setLoading(false);
    }
  };

  const handleOTP = async () => {
    try {
      await api.get(`/checkotp/${username}`);
      if (resendCount === 3) {
        setIsResendDisabled(true);
        setAlertMessage("You can only resend OTP 3 times.");
        setIsAlertModalVisible(true);
        setOTPClicked(false);
        await api.get(`/limitotp/${username}`);
        return;
      }
      setOTPClicked(true);
      setResendCount((prevCount) => prevCount + 1);
      setResendTimer(30);
      sendOTP(
        username,
        user.resID?.mobilenumber || user.empID?.resID.mobilenumber
      );
    } catch (error) {
      if (error.response && error.response.status === 429) {
        setAlertMessage(
          "OTP use is currently disabled. Try again after 30 minutes."
        );
        setIsAlertModalVisible(true);
      } else {
        console.error("Error checking OTP:", error);
      }
    }
  };

  const passwordValidation = (val) => {
    let errors = [];
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
        "Password can only contain letters, numbers, and !, @, $, %, ^, &, *, +, #."
      );
    }
    setPasswordErrors(errors);
  };

  const repasswordValidation = (val) => {
    let errors = [];
    let formattedVal = val.replace(/\s+/g, "");
    setReNewPassword(formattedVal);

    if (!formattedVal) {
      errors.push("This field is required!");
    }
    if (formattedVal !== newPassword && formattedVal.length > 0) {
      errors.push("Passwords do not match!");
    }
    setRePasswordErrors(errors);
  };

  const handleConfirm = () => {
    let hasErrors = false;
    let perrors = [];
    let rerrors = [];
    if (!newPassword) {
      perrors.push("This field is required!");
      setPasswordErrors(perrors);
      hasErrors = true;
    }
    if (!renewPassword) {
      rerrors.push("This field is required!");
      setRePasswordErrors(rerrors);
      hasErrors = true;
    }

    if (repasswordErrors.includes("Passwords do not match!")) {
      hasErrors = true;
    }
    if (hasErrors) {
      return;
    }

    setIsConfirmModalVisible(true);
  };

  const handleSuccessful = async () => {
    setIsConfirmModalVisible(false);
    if (loading) return;

    setLoading(true);
    try {
      await api.post(`/newpassword/${username}`, { newPassword });
      setIsSuccess(true);
      setAlertMessage("Your password is now updated.");
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
    } finally {
      setLoading(false);
    }
    setIsAlertModalVisible(true);
    setAlertMessage(message);
    setIsSuccess(false);
  };

  useEffect(() => {
    if (!isOTPClicked || !isResendDisabled) return;
    let interval = null;
    if (isResendDisabled) {
      interval = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setIsResendDisabled(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isResendDisabled, isOTPClicked]);

  const handleResend = async () => {
    if (resendCount < 3) {
      try {
        sendOTP(
          username,
          user.resID?.mobilenumber || user.empID?.resID.mobilenumber
        );
        setResendTimer(30);
        setIsResendDisabled(true);
        setResendCount((prevCount) => prevCount + 1);
        console.log("New OTP is generated");
      } catch (error) {
        console.error("Error sending OTP:", error);
        setAlertMessage("Something went wrong while sending OTP");
        setIsAlertModalVisible(true);
      }
    } else {
      await api.get(`/limitotp/${username}`);
      setAlertMessage("You can only resend OTP 3 times.");
      setIsAlertModalVisible(true);
    }
  };

  const handleVerify = async (OTP) => {
    try {
      const result = await verifyOTP(username, OTP);
      // setAlertMessage(result.message);
      // setIsAlertModalVisible(true);
      setIsVerified(true);
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
  };

  useEffect(() => {
    if (isOTPClicked && OTP.length === 6) {
      const timeout = setTimeout(() => {
        handleVerify();
      }, 500);

      return () => clearTimeout(timeout);
    }
  }, [OTP, isOTPClicked]);

  const handleOTPChange = (text) => {
    if (text.length === 6) {
      handleVerify(text);
    }
  };

  const BackgroundOverlay = () => (
    <View style={{ position: "relative", height: "100%", width: "100%" }}>
      <LinearGradient
        colors={["#0e94d3", "#0a70a0", "#095e86", "#074c6d"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          height: "100%",
          width: "100%",
          zIndex: -1,
        }}
      />

      <Image source={AppLogo} style={MyStyles.overlayLogo} />

      <View style={MyStyles.overlayBlack} />
    </View>
  );

  const maskMobileNumber = (number) => {
    if (!number || number.length < 4) return number;
    const start = number.slice(0, 2);
    const end = number.slice(-2);
    const masked = "*".repeat(number.length - 4);
    return `${start}${masked}${end}`;
  };

  const togglesecureAnswer = () => {
    setsecureAnswer(!secureAnswer);
  };

  const handleCloseSuccessModal = () => {
    setIsAlertModalVisible(false);
    navigation.navigate("Login");
    setNewPassword("");
    setReNewPassword("");
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
        <AlertModal
          isVisible={isAlertModalVisible}
          message={alertMessage}
          onClose={() => setIsAlertModalVisible(false)}
        />
        {/* 1st Design */}
        {!isExisting && (
          <View style={MyStyles.loginWrapper}>
            <View style={MyStyles.loginTopWrapper}>
              <Image source={AppLogo} style={MyStyles.loginLogo} />
            </View>

            <View style={MyStyles.loginBottomWrapper}>
              <Text style={[MyStyles.header, { alignSelf: "flex-start" }]}>
                Forgot Password
              </Text>
              <Text style={MyStyles.forgotMsg}>
                Please enter your username to begin the password reset process.
              </Text>

              <View style={MyStyles.loginFormWrapper}>
                <View>
                  <Text style={MyStyles.inputLabel}>
                    Username<Text style={{ color: "red" }}>*</Text>
                  </Text>
                  <TextInput
                    onChangeText={setUsername}
                    placeholder="Username"
                    style={MyStyles.input}
                  />
                </View>
              </View>

              <TouchableOpacity
                onPress={handleSubmit}
                style={MyStyles.button}
                disabled={loading}
              >
                <Text style={MyStyles.buttonText}>
                  {loading ? "Checking..." : "Continue"}
                </Text>
              </TouchableOpacity>

              <Text
                onPress={() => navigation.navigate("Login")}
                style={[MyStyles.forgotPassText, { marginTop: 5 }]}
              >
                Remember password?
              </Text>
            </View>
          </View>
        )}

        {/* 2nd Design */}
        {isExisting && (
          <>
            {/* Reset Password */}
            {isVerified ? (
              <>
                <BackgroundOverlay />
                <View style={MyStyles.forgotCardWrapper}>
                  <View style={MyStyles.forgotCard}>
                    <ScrollView showsVerticalScrollIndicator={false}>
                      <AntDesign
                        onPress={() => {
                          setIsExisting(false);
                          setIsVerified(false);
                          setQuestionsClicked(false);
                          setOTPClicked(false);
                          setNewPassword("");
                          setReNewPassword("");
                          setSecurityQuestion({
                            question: "",
                            answer: "",
                          });
                        }}
                        name="arrowleft"
                        style={MyStyles.backArrow}
                      />

                      <Text style={MyStyles.header}>Reset Password</Text>

                      <Text style={MyStyles.forgotMsg}>
                        To ensure the security of your account, please create a
                        new password.
                      </Text>

                      <View style={[MyStyles.loginFormWrapper, { gap: 30 }]}>
                        <View>
                          <Text style={MyStyles.inputLabel}>
                            New Password<Text style={{ color: "red" }}>*</Text>
                          </Text>
                          <View style={MyStyles.eyeInputContainer}>
                            <TextInput
                              onChangeText={passwordValidation}
                              value={newPassword}
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
                                color="#808080"
                              />
                            </TouchableOpacity>
                          </View>
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

                        <View>
                          <Text style={MyStyles.inputLabel}>
                            Confirm New Password
                            <Text style={{ color: "red" }}>*</Text>
                          </Text>

                          <View style={{ position: "relative" }}>
                            <TextInput
                              onChangeText={repasswordValidation}
                              secureTextEntry={secureConfirmPass}
                              value={renewPassword}
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
                                color="#808080"
                              />
                            </TouchableOpacity>
                          </View>
                          {repasswordErrors.length > 0 && (
                            <View style={{ marginTop: 5, width: 300 }}>
                              {repasswordErrors.map((error, index) => (
                                <Text key={index} style={MyStyles.errorMsg}>
                                  {error}
                                </Text>
                              ))}
                            </View>
                          )}
                        </View>
                      </View>

                      <TouchableOpacity
                        onPress={handleConfirm}
                        style={MyStyles.button}
                        disabled={loading}
                      >
                        <Text style={MyStyles.buttonText}>
                          {loading ? "Resetting..." : "Reset"}
                        </Text>
                      </TouchableOpacity>
                    </ScrollView>
                  </View>
                  <AlertModal
                    isVisible={isAlertModalVisible}
                    message={alertMessage}
                    isSuccess={isSuccess}
                    onClose={() => setIsAlertModalVisible(false)}
                    onConfirm={handleCloseSuccessModal}
                  />
                  <AlertModal
                    isVisible={isConfirmModalVisible}
                    isConfirmationModal={true}
                    title="Reset Password?"
                    message="Are you sure you want to reset your Password?"
                    onClose={() => setIsConfirmModalVisible(false)}
                    onConfirm={handleSuccessful}
                  />
                </View>
              </>
            ) : /* One-Time Password */ isOTPClicked ? (
              <>
                <BackgroundOverlay />
                <View style={MyStyles.forgotCardWrapper}>
                  <View style={MyStyles.forgotCard}>
                    <ScrollView
                      showsVerticalScrollIndicator={false}
                      style={{ marginBottom: 10 }}
                    >
                      <AntDesign
                        onPress={() => setOTPClicked(false)}
                        name="arrowleft"
                        style={MyStyles.backArrow}
                      />
                      <Text style={MyStyles.header}>Account Verification</Text>

                      <Text style={MyStyles.forgotMsg}>
                        Enter the 6-digit code sent to
                      </Text>
                      <Text
                        style={[
                          MyStyles.forgotMsg,

                          {
                            marginTop: 5,
                            color: "#04384E",
                          },
                        ]}
                      >
                        {maskMobileNumber(
                          user.resID?.mobilenumber ||
                            user.empID?.resID.mobilenumber
                        )}
                      </Text>

                      <View style={{ marginTop: 30 }}>
                        <OtpInput
                          ref={otpRef}
                          type="numeric"
                          numberOfDigits={6}
                          onTextChange={handleOTPChange}
                        />
                      </View>

                      {isResendDisabled ? (
                        <Text
                          style={[
                            MyStyles.forgotMsg,
                            { alignSelf: "flex-end", marginTop: 20 },
                          ]}
                        >
                          Resend OTP in{" "}
                          <Text style={{ color: "red" }}>{resendTimer} </Text>
                          second
                          {resendTimer !== 1 ? "s" : ""}
                        </Text>
                      ) : (
                        <View
                          style={{
                            flexDirection: "row",
                            gap: 4,
                            alignSelf: "flex-end",
                            marginTop: 20,
                          }}
                        >
                          <Text style={MyStyles.byClickingText}>
                            Didn't get a code?
                          </Text>
                          <Text
                            onPress={handleResend}
                            style={MyStyles.resendOTPText}
                          >
                            Resend OTP
                          </Text>
                        </View>
                      )}
                    </ScrollView>
                  </View>
                </View>
              </>
            ) : /* Security Questions */ isQuestionsClicked ? (
              <>
                <BackgroundOverlay />

                <View style={MyStyles.forgotCardWrapper}>
                  <View style={[MyStyles.forgotCard]}>
                    <ScrollView showsVerticalScrollIndicator={false}>
                      <AntDesign
                        onPress={() => setQuestionsClicked(false)}
                        name="arrowleft"
                        style={MyStyles.backArrow}
                      />

                      <Text style={MyStyles.header}>Security Question</Text>

                      <Text style={MyStyles.forgotMsg}>
                        To verify your identity, please answer your chosen
                        security question below.
                      </Text>

                      <View style={MyStyles.loginFormWrapper}>
                        <View>
                          <Text style={MyStyles.inputLabel}>
                            Security Question
                            <Text style={{ color: "red" }}>*</Text>
                          </Text>
                          <Dropdown
                            labelField="label"
                            valueField="value"
                            value={securityquestion.question}
                            data={user.securityquestions?.map((q) => ({
                              label: q.question,
                              value: q.question,
                            }))}
                            placeholder="Select"
                            placeholderStyle={MyStyles.placeholderText}
                            selectedTextStyle={MyStyles.selectedText}
                            onChange={(item) =>
                              handleInputChange("question", item.value)
                            }
                            style={MyStyles.input}
                          ></Dropdown>
                        </View>

                        <View>
                          <Text style={MyStyles.inputLabel}>
                            Answer
                            <Text style={{ color: "red" }}>*</Text>
                          </Text>
                          <View style={MyStyles.eyeInputContainer}>
                            <TextInput
                              onChangeText={(e) =>
                                handleInputChange("answer", e)
                              }
                              secureTextEntry={secureAnswer}
                              placeholder="Answer"
                              style={MyStyles.input}
                            />
                            <TouchableOpacity
                              style={MyStyles.eyeToggle}
                              onPress={togglesecureAnswer}
                            >
                              <Ionicons
                                name={secureAnswer ? "eye-off" : "eye"}
                                size={24}
                                color="gray"
                              />
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>

                      <TouchableOpacity
                        onPress={handleQuestionVerify}
                        style={MyStyles.button}
                        disabled={loading}
                      >
                        <Text style={MyStyles.buttonText}>
                          {loading ? "Verifying..." : "Verify"}
                        </Text>
                      </TouchableOpacity>
                    </ScrollView>
                  </View>
                </View>
              </>
            ) : (
              /* Verification Method */
              <>
                <BackgroundOverlay />
                {/* Card container with transparency */}
                <View style={MyStyles.forgotCardWrapper}>
                  <View style={MyStyles.forgotCard}>
                    <ScrollView showsVerticalScrollIndicator={false}>
                      <AntDesign
                        onPress={() => setIsExisting(false)}
                        name="arrowleft"
                        style={MyStyles.backArrow}
                      />

                      <Text style={MyStyles.header}>Verification Method</Text>

                      <Text style={MyStyles.forgotMsg}>
                        Please choose a method to verify your identity and
                        continue resetting your password
                      </Text>

                      <View style={MyStyles.methodOptionsWrapper}>
                        <TouchableOpacity
                          onPress={handleOTP}
                          style={MyStyles.methodOptions}
                        >
                          <MaterialIcons
                            name="password"
                            style={MyStyles.forgotPassMethodsIcon}
                          />
                          <Text style={MyStyles.forgotPassMethodsText}>
                            One Time Password
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={() => {
                            if (
                              !user.securityquestions ||
                              user.securityquestions.length === 0
                            ) {
                              setAlertMessage(
                                "No security questions found for this account."
                              );
                              setIsAlertModalVisible(true);
                            } else {
                              setQuestionsClicked(true);
                            }
                          }}
                          style={MyStyles.methodOptions}
                        >
                          <MaterialCommunityIcons
                            name="comment-question"
                            style={MyStyles.forgotPassMethodsIcon}
                          />
                          <Text style={MyStyles.forgotPassMethodsText}>
                            Security Question
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </ScrollView>
                  </View>
                </View>
              </>
            )}
          </>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
};

export default ForgotPassword;
