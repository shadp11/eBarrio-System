import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  ScrollView,
  Touchable,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { MyStyles } from "./stylesheet/MyStyles";
import { Dropdown } from "react-native-element-dropdown";
import { useContext, useEffect, useState } from "react";
import { InfoContext } from "../context/InfoContext";
import api from "../api";
import AlertModal from "./AlertModal";

//ICONS
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";

const EditSecurityQuestions = () => {
  const { fetchUserDetails, userDetails } = useContext(InfoContext);
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [password, setPassword] = useState("");
  const [passError, setPassError] = useState("");
  const [securityquestions, setSecurityQuestions] = useState([
    { question: "", answer: "" },
    { question: "", answer: "" },
  ]);
  const [securePass, setsecurePass] = useState(true);
  const [secureAnswer1, setsecureAnswer1] = useState(true);
  const [secureAnswer2, setsecureAnswer2] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
  const [isAlertModalVisible, setIsAlertModalVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const togglesecurePass = () => {
    setsecurePass(!securePass);
  };

  const togglesecureAnswer1 = () => {
    setsecureAnswer1(!secureAnswer1);
  };

  const togglesecureAnswer2 = () => {
    setsecureAnswer2(!secureAnswer2);
  };

  useEffect(() => {
    fetchUserDetails();
  }, []);

  const handlePassChange = (input) => {
    if (input.length === 0) {
      setPassError("This field is required!.");
    } else {
      setPassError("");
    }
    setPassword(input);
  };

  useEffect(() => {
    if (
      userDetails &&
      Array.isArray(userDetails.securityquestions) &&
      userDetails.securityquestions.length >= 2
    ) {
      setSecurityQuestions([
        {
          question: userDetails.securityquestions[0]?.question || "",
          answer: "",
        },
        {
          question: userDetails.securityquestions[1]?.question || "",
          answer: "",
        },
      ]);
    }
  }, [userDetails]);

  const securityQuestionsList = [
    "What was the name of your first pet?",
    "What is your mother's maiden name?",
    "What was the name of your first school?",
  ];

  const handleSecurityChange = (index, field, value) => {
    const updated = [...securityquestions];
    updated[index][field] = value;
    setSecurityQuestions(updated);
  };

  let modifiedQuestions;

  const handleConfirm = () => {
    let hasErrors = false;

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

  const handleQuestionsChange = async () => {
    setIsConfirmModalVisible(false);
    if (loading) return;
    setLoading(true);

    let sameAnswerFound = false;

    modifiedQuestions = securityquestions?.map((q, index) => {
      const current = userDetails.securityquestions?.[index];
      const isSameQuestion = current?.question === q.question;
      const hasNewAnswer = q.answer?.trim() !== "";
      const isSameAnswer =
        q.answer?.trim().toLowerCase() ===
        current?.answer?.trim().toLowerCase();

      if (hasNewAnswer && isSameAnswer) {
        sameAnswerFound = true;
      }

      if (!isSameQuestion && hasNewAnswer) {
        return q;
      } else if (isSameQuestion && hasNewAnswer && !isSameAnswer) {
        return { question: q.question, answer: q.answer };
      } else {
        return null;
      }
    });

    const hasChanges = modifiedQuestions.some((q) => q !== null);

    if (!hasChanges) {
      setAlertMessage(
        "No changes have been made. Please input answer to change security questions"
      );
      setIsSuccess(false);
      setIsAlertModalVisible(true);
      setLoading(false);
      setIsConfirmModalVisible(false);
      return;
    }

    try {
      await api.put("/changesecurityquestions", {
        securityquestions: modifiedQuestions,
        password,
      });
      setIsSuccess(true);
      setAlertMessage("Your security question has been updated.");
      fetchUserDetails();

      setSecurityQuestions((prev) =>
        prev.map((item) => ({
          ...item,
          answer: "",
        }))
      );
      setPassword("");
    } catch (error) {
      const response = error.response;
      if (response && response.data) {
        console.log("❌ Error status:", response.status);
        setAlertMessage(response.data.message || "Something went wrong.");
      } else {
        console.log("❌ Network or unknown error:", error.message);
        setAlertMessage("An unexpected error occurred.");
      }
      setIsSuccess(false);
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
            onPress={() => navigation.navigate("AccountSettings")}
            name="arrowleft"
            style={MyStyles.backArrow}
          />

          <Text style={[MyStyles.servicesHeader, { marginTop: 0 }]}>
            Change Security Questions
          </Text>

          <View style={MyStyles.servicesContentWrapper}>
            <View>
              <Text style={MyStyles.inputLabel}>Security Question #1</Text>
              <Dropdown
                labelField="label"
                valueField="value"
                value={securityquestions[0].question}
                data={securityQuestionsList
                  .filter((ques) => ques !== securityquestions[1].question)
                  .map((ques) => ({
                    label: ques,
                    value: ques,
                  }))}
                placeholder="Select"
                onChange={(item) =>
                  handleSecurityChange(0, "question", item.value)
                }
                placeholderStyle={MyStyles.placeholderText}
                selectedTextStyle={MyStyles.selectedText}
                style={MyStyles.input}
              ></Dropdown>
            </View>
            <View>
              <Text style={MyStyles.inputLabel}>Answer</Text>
              <View style={MyStyles.eyeInputContainer}>
                <TextInput
                  value={securityquestions[0].answer}
                  onChangeText={(e) => handleSecurityChange(0, "answer", e)}
                  secureTextEntry={secureAnswer1}
                  placeholder="Answer"
                  style={MyStyles.input}
                />
                <TouchableOpacity
                  style={MyStyles.eyeToggle}
                  onPress={togglesecureAnswer1}
                >
                  <Ionicons
                    name={secureAnswer1 ? "eye-off" : "eye"}
                    size={24}
                    color="gray"
                  />
                </TouchableOpacity>
              </View>
            </View>
            <View>
              <Text style={MyStyles.inputLabel}>Security Question #2</Text>
              <Dropdown
                labelField="label"
                valueField="value"
                value={securityquestions[1].question}
                data={securityQuestionsList
                  .filter((ques) => ques !== securityquestions[0].question)
                  .map((ques) => ({
                    label: ques,
                    value: ques,
                  }))}
                placeholder="Select"
                onChange={(item) =>
                  handleSecurityChange(1, "question", item.value)
                }
                placeholderStyle={MyStyles.placeholderText}
                selectedTextStyle={MyStyles.selectedText}
                style={MyStyles.input}
              ></Dropdown>
            </View>

            <View>
              <Text style={MyStyles.inputLabel}>Answer</Text>
              <View style={MyStyles.eyeInputContainer}>
                <TextInput
                  value={securityquestions[1].answer}
                  onChangeText={(e) => handleSecurityChange(1, "answer", e)}
                  secureTextEntry={secureAnswer2}
                  placeholder="Answer"
                  style={MyStyles.input}
                />
                <TouchableOpacity
                  style={MyStyles.eyeToggle}
                  onPress={togglesecureAnswer2}
                >
                  <Ionicons
                    name={secureAnswer2 ? "eye-off" : "eye"}
                    size={24}
                    color="gray"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View>
              <Text style={MyStyles.inputLabel}>
                Password<Text style={MyStyles.redAsterisk}>*</Text>
              </Text>
              <View style={MyStyles.eyeInputContainer}>
                <TextInput
                  onChangeText={handlePassChange}
                  value={password}
                  secureTextEntry={securePass}
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
            title="Change Security Questions?"
            message="Are you sure you want to change your security questions? This action cannot be undone."
            onClose={() => setIsConfirmModalVisible(false)}
            onConfirm={handleQuestionsChange}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default EditSecurityQuestions;
