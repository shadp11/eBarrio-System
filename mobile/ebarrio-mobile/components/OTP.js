import { Text, View, Image, SafeAreaView } from "react-native";
import { MyStyles } from "./stylesheet/MyStyles";
import { useContext, useState, useEffect, useRef } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import { OtpContext } from "../context/OtpContext";
import { OtpInput } from "react-native-otp-entry";
import api from "../api";
import { AuthContext } from "../context/AuthContext";
import AppLogo from "..//assets/applogo-darkbg.png";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RFPercentage } from "react-native-responsive-fontsize";
import AlertModal from "./AlertModal";
import { LinearGradient } from "expo-linear-gradient";

const OTP = ({}) => {
  const route = useRoute();
  const {
    resID = "",
    mobilenumber = "",
    username = "",
    password = "",
    securityquestions = "",
    navigatelink = "",
  } = route.params || {};

  const navigation = useNavigation();
  const [resendTimer, setResendTimer] = useState(30);
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const [resendCount, setResendCount] = useState(0);
  const { sendOTP, verifyOTP } = useContext(OtpContext);
  const { login } = useContext(AuthContext);
  const otpRef = useRef(null);
  const insets = useSafeAreaInsets();
  const [isAlertModalVisible, setIsAlertModalVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
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
  }, [isResendDisabled]);

  const handleResend = async () => {
    if (resendCount < 3) {
      try {
        sendOTP(username, mobilenumber);
        setResendTimer(30);
        setIsResendDisabled(true);
        setResendCount((prevCount) => prevCount + 1);
      } catch (error) {
        console.error("Error sending OTP:", error);
        setAlertMessage("Something went wrong while sending OTP");
        setIsAlertModalVisible(true);
      }
    } else {
      setAlertMessage("You can only resend OTP 3 times.");
      setIsAlertModalVisible(true);
    }
  };

  const handleVerify = async (OTP) => {
    try {
      const result = await verifyOTP(username, OTP);
      if (navigatelink === "Login") {
        setIsSuccess(true);
        setAlertMessage("New Resident Account Created.");
        setIsAlertModalVisible(true);
      } else {
        await login({ username, password });
      }
    } catch (error) {
      const response = error.response;
      if (response && response.data) {
        setAlertMessage(response.data.message || "Something went wrong.");
      } else {
        setAlertMessage("An unexpected error occurred.");
      }
      setIsAlertModalVisible(true);
    }
  };

  const handleSuccessModalClose = async () => {
    setIsAlertModalVisible(false);

    if (navigatelink === "Login") {
      try {
        await api.post("/register", { username, password, resID });
        navigation.navigate("Login");
      } catch (error) {
        console.log("Error logging in", error);
      }
    } else if (navigatelink === "BottomTabs") {
      await login({ username, password });
    }
  };

  const handleOTPChange = (text) => {
    if (text.length === 6) {
      handleVerify(text);
    }
  };

  const maskMobileNumber = (number) => {
    if (!number || number.length < 4) return number;
    const start = number.slice(0, 2);
    const end = number.slice(-2);
    const masked = "*".repeat(number.length - 4);
    return `${start}${masked}${end}`;
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
        <View style={MyStyles.loginWrapper}>
          <View style={MyStyles.loginTopWrapper}>
            <Image source={AppLogo} style={MyStyles.loginLogo} />
          </View>
          <View
            style={{
              alignItems: "start",
              backgroundColor: "#fff",
              borderRadius: 15,
              flex: 3,
              paddingHorizontal: 20,
              paddingVertical: 20,
              gap: 20,
            }}
          >
            <Text style={[MyStyles.header, { alignSelf: "flex-start" }]}>
              Account Verification
            </Text>
            <Text
              style={{
                fontSize: RFPercentage(2),
                color: "#808080",
                fontFamily: "QuicksandSemiBold",
              }}
            >
              Enter the 6-digit code sent to
            </Text>
            <Text
              style={{
                fontSize: RFPercentage(2),
                color: "#04384E",
                fontFamily: "QuicksandSemiBold",
                marginTop: "-20",
              }}
            >
              {maskMobileNumber(mobilenumber)}
            </Text>
            <OtpInput
              ref={otpRef}
              type="numeric"
              numberOfDigits={6}
              onTextChange={handleOTPChange}
            />

            {isResendDisabled ? (
              <Text
                style={{
                  fontSize: RFPercentage(2),
                  color: "#808080",
                  fontFamily: "QuicksandSemiBold",
                  alignSelf: "flex-end",
                }}
              >
                Resend OTP in{" "}
                <Text style={{ color: "red" }}>{resendTimer} </Text> second
                {resendTimer !== 1 ? "s" : ""}
              </Text>
            ) : (
              <View style={{ flexDirection: "row", gap: 4 }}>
                <Text
                  onPress={handleResend}
                  style={{
                    fontSize: RFPercentage(2),
                    color: "#808080",
                    fontFamily: "QuicksandSemiBold",
                    alignSelf: "flex-end",
                  }}
                >
                  Didn't get a code?
                </Text>
                <Text
                  onPress={handleResend}
                  style={{
                    color: "red",
                    fontSize: RFPercentage(2),
                    fontFamily: "QuicksandBold",
                  }}
                >
                  Resend OTP
                </Text>
              </View>
            )}
          </View>

          <AlertModal
            isVisible={isAlertModalVisible}
            message={alertMessage}
            title={isSuccess ? "Success" : "Error"}
            isSuccess={isSuccess}
            onConfirm={handleSuccessModalClose}
            onClose={() => setIsAlertModalVisible(false)}
          />
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};
export default OTP;
