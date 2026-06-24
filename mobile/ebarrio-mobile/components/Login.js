import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Dimensions,
} from "react-native";
import { MyStyles } from "./stylesheet/MyStyles";
import { useContext, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from "../context/AuthContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { OtpContext } from "../context/OtpContext";
import api from "../api";
import AppLogo from "..//assets/applogo-darkbg.png";
import AlertModal from "./AlertModal";
import { LinearGradient } from "expo-linear-gradient";

//ICONS
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import Fontisto from "@expo/vector-icons/Fontisto";
import Ionicons from "@expo/vector-icons/Ionicons";

const Login = () => {
  const insets = useSafeAreaInsets();
  const { sendOTP } = useContext(OtpContext);
  const { login } = useContext(AuthContext);
  const navigation = useNavigation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [secureLoginPass, setsecureLoginPass] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isAlertModalVisible, setIsAlertModalVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  // Toggle Password Visibility
  const togglesecureLoginPass = () => {
    setsecureLoginPass(!secureLoginPass);
  };

  const handleLogin = async () => {
    if (!username && !password) {
      setAlertMessage("Both fields need to be filled before signing in.");
      setIsAlertModalVisible(true);
      return;
    } else if (!username) {
      setAlertMessage("Username is required!");
      setIsAlertModalVisible(true);
      return;
    } else if (!password) {
      setAlertMessage("Password is required!");
      setIsAlertModalVisible(true);
      return;
    }

    if (loading) return;

    setLoading(true);
    try {
      const res = await api.post("/checkcredentials", {
        username,
        password,
      });
      if (res.status === 200) {
        if (res.data.message === "Credentials verified") {
          await login({ username, password });
          // const response = await api.get(`/getmobilenumber/${username}`);
          // sendOTP(username, response.data.mobilenumber);
          // navigation.navigate("OTP", {
          //   navigatelink: "BottomTabs",
          //   username,
          //   mobilenumber: response.data.mobilenumber,
          //   password: password,
          // });
        } else if (res.data.message === "Token verified successfully!") {
          navigation.navigate("SetPassword", {
            username,
          });
        }
      }
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

          <View style={MyStyles.loginBottomWrapper}>
            <Text style={[MyStyles.header, { alignSelf: "flex-start" }]}>
              Welcome!
            </Text>
            <Text style={MyStyles.forgotMsg}>
              Please enter your credentials to log in.
            </Text>
            <View style={MyStyles.loginFormWrapper}>
              <View
                style={{
                  position: "relative",
                }}
              >
                <TextInput
                  style={[
                    MyStyles.input,
                    {
                      paddingLeft: 50,
                      paddingRight: 40,
                    },
                  ]}
                  placeholder="Username"
                  value={username}
                  onChangeText={setUsername}
                />

                <FontAwesome5
                  name="user-alt"
                  size={20}
                  color="#04384E"
                  style={{
                    position: "absolute",
                    left: 15,
                    top: "50%",
                    transform: [{ translateY: -10 }],
                  }}
                />
              </View>

              <View
                style={{
                  position: "relative",
                }}
              >
                <TextInput
                  secureTextEntry={secureLoginPass}
                  style={[
                    MyStyles.input,
                    {
                      paddingLeft: 50,
                      paddingRight: 40,
                    },
                  ]}
                  placeholder="Password"
                  value={password}
                  onChangeText={setPassword}
                />

                <Fontisto
                  name="locked"
                  size={20}
                  color="#04384E"
                  style={{
                    position: "absolute",
                    left: 15,
                    top: "50%",
                    transform: [{ translateY: -10 }],
                  }}
                />
                <TouchableOpacity
                  onPress={togglesecureLoginPass}
                  style={MyStyles.eyeToggle}
                >
                  <Ionicons
                    name={secureLoginPass ? "eye-off" : "eye"}
                    style={MyStyles.eyeToggleSize}
                  />
                </TouchableOpacity>
              </View>

              <Text
                onPress={() => navigation.navigate("ForgotPassword")}
                style={MyStyles.forgotPassText}
              >
                Forgot Password?
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleLogin}
              style={MyStyles.button}
              disabled={loading}
            >
              <Text style={MyStyles.buttonText}>
                {loading ? "Logging in..." : "Login"}
              </Text>
            </TouchableOpacity>
            <View style={{ flexDirection: "row", gap: 4, marginTop: 10 }}>
              <Text style={MyStyles.byClickingText}>
                Don't have an account?
              </Text>
              <Text
                onPress={() => navigation.navigate("Signup")}
                style={MyStyles.signUpText}
              >
                Sign Up
              </Text>
            </View>
          </View>

          <AlertModal
            isVisible={isAlertModalVisible}
            message={alertMessage}
            onClose={() => setIsAlertModalVisible(false)}
          />
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};
export default Login;