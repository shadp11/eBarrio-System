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
import { useContext, useEffect, useState } from "react";
import { InfoContext } from "../context/InfoContext";
import api from "../api";
import AlertModal from "./AlertModal";

//ICONS
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";

const ChangeUsername = () => {
  const { fetchUserDetails, userDetails } = useContext(InfoContext);
  const [username, setUsername] = useState("");
  const [usernameErrors, setUsernameErrors] = useState([]);
  const [password, setPassword] = useState("");
  const [passError, setPassError] = useState("");
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [securePass, setsecurePass] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
  const [isAlertModalVisible, setIsAlertModalVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  // Toggle Password Visibility in Reset Password
  const togglesecurePass = () => {
    setsecurePass(!securePass);
  };

  useEffect(() => {
    fetchUserDetails();
  }, []);

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

  const handleConfirm = async () => {
    let hasErrors = false;

    usernameValidation(username);
    if (usernameErrors.length !== 0) {
      hasErrors = true;
    }

    if (!password) {
      setPassError("This field is required!");
      hasErrors = true;
    } else {
      setPassError("");
    }

    if (hasErrors) {
      return;
    }
    setIsConfirmModalVisible(true);
  };

  const handleUsernameChange = async () => {
    setIsConfirmModalVisible(false);
    if (loading) return;

    setLoading(true);
    try {
      await api.get(`/checkusername/${username}`);
      try {
        await api.put("/changeusername", { username, password });
        setIsSuccess(true);
        setAlertMessage("Your username has been updated");
        fetchUserDetails();
      } catch (error) {
        const response = error.response;
        if (response && response.data) {
          console.log("❌ Error status:", response.status);
          setAlertMessage(response.data.message || "Something went wrong.");
        } else {
          console.log("❌ Network or unknown error:", error.message);
          setAlertMessage("An unexpected error occurred.");
        }
      }
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

  const handlePassChange = (input) => {
    if (input.length === 0) {
      setPassError("This field is required!");
    } else {
      setPassError("");
    }
    setPassword(input);
  };

  const maskUsername = (uname) => {
    if (!uname) return "";
    if (uname.length <= 2) return uname[0] + "*";

    const firstChar = uname[0];
    const lastChar = uname[uname.length - 1];
    const maskedLength = uname.length - 2;
    const masked = "*".repeat(maskedLength);
    return `${firstChar}${masked}${lastChar}`;
  };

  const handleCloseAlertModal = () => {
    setIsAlertModalVisible(false);
    setUsername("");
    setPassword("");
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
          Change Username
        </Text>

        <View style={MyStyles.servicesContentWrapper}>
          <View>
            <Text style={MyStyles.inputLabel}>Current Username</Text>
            <Text style={MyStyles.inputLabel}>
              {maskUsername(userDetails?.username)}
            </Text>
          </View>
          <View>
            <Text style={MyStyles.inputLabel}>
              New Username<Text style={MyStyles.redAsterisk}>*</Text>
            </Text>
            <TextInput
              onChangeText={usernameValidation}
              placeholder="New Username"
              style={MyStyles.input}
              value={username}
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
              Password<Text style={MyStyles.redAsterisk}>*</Text>
            </Text>
            <View style={MyStyles.eyeInputContainer}>
              <TextInput
                onChangeText={handlePassChange}
                secureTextEntry={securePass}
                value={password}
                placeholder="Password"
                style={[MyStyles.input, { paddingRight: 40 }]}
              />
              <TouchableOpacity
                style={MyStyles.eyeToggle}
                onPress={togglesecurePass}
              >
                <Ionicons
                  name={securePass ? "eye-off" : "eye"}
                  size={24}
                  color="gray"
                />
              </TouchableOpacity>
              {passError ? (
                <Text style={MyStyles.errorMsg}>{passError}</Text>
              ) : null}
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
          title="Change Username?"
          message="Are you sure you want to change your username? This action cannot be undone, and you can only change it again after 60 days."
          onClose={() => setIsConfirmModalVisible(false)}
          onConfirm={handleUsernameChange}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default ChangeUsername;
