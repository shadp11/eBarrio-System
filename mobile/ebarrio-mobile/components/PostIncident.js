import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
} from "react-native";
import { useContext, useState } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import { AuthContext } from "../context/AuthContext";
import { storage } from "../firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import * as FileSystem from "expo-file-system";
import api from "../api";
import { MyStyles } from "./stylesheet/MyStyles";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AlertModal from "./AlertModal";
import * as ImagePicker from "expo-image-picker";
import { RFPercentage } from "react-native-responsive-fontsize";

//ICONS
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import Entypo from "@expo/vector-icons/Entypo";
import Feather from "@expo/vector-icons/Feather";

const PostIncident = () => {
  const route = useRoute();
  const { selectedID } = route.params;
  const insets = useSafeAreaInsets();
  const { user } = useContext(AuthContext);
  const navigation = useNavigation();
  const [postIncidentForm, setPostIncidentForm] = useState({
    postreportdetails: "",
    evidence: "",
  });
  const [loading, setLoading] = useState(false);
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
  const [isEvidenceProcessing, setIsEvidenceProcessing] = useState(false);
  const [isAlertModalVisible, setIsAlertModalVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleInputChange = (name, value) => {
    setPostIncidentForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const pickEvidenceImage = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission required",
          "We need access to your photos to let you upload an image."
        );
        return;
      }

      setIsEvidenceProcessing(true);

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled && result.assets?.length > 0) {
        setPostIncidentForm((prev) => ({
          ...prev,
          evidence: result.assets[0].uri,
        }));
      }
    } catch (error) {
      console.error("Error picking image:", error);
      setAlertMessage("Something went wrong while picking the image.");
      setIsAlertModalVisible(true);
    } finally {
      setIsEvidenceProcessing(false);
    }
  };

  const toggleEvidenceCamera = async () => {
    const permissionResult = await ImagePicker.getCameraPermissionsAsync();

    if (!permissionResult.granted) {
      const askPermission = await ImagePicker.requestCameraPermissionsAsync();
      if (!askPermission.granted) {
        setAlertMessage("Camera permission is required.");
        setIsAlertModalVisible(true);
        return;
      }
    }
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        quality: 1,
      });

      if (!result.canceled) {
        setPostIncidentForm((prev) => ({
          ...prev,
          evidence: result.assets[0].uri,
        }));
      }
    } catch (error) {
      console.error("Camera error:", error);
      setAlertMessage("Failed to open camera.");
      setIsAlertModalVisible(true);
    }
  };

  const handleConfirm = () => {
    if (!postIncidentForm.postreportdetails.trim()) {
      setAlertMessage("Please input details for the post-incident report.");
      setIsAlertModalVisible(true);
      return;
    }

    if (postIncidentForm.postreportdetails.trim().length < 10) {
      setAlertMessage(
        "Post-incident report details must be at least 10 characters."
      );
      setIsAlertModalVisible(true);
      return;
    }
    setIsConfirmModalVisible(true);
  };

  async function uploadToFirebase(fileUriOrBase64) {
    try {
      let fileUri = fileUriOrBase64;

      if (fileUri.startsWith("data:")) {
        fileUri = await base64ToFile(fileUriOrBase64);
      }

      const randomString = Math.random().toString(36).substring(2, 15);
      const fileName = `id_images/${Date.now()}_${randomString}.jpg`;
      const storageRef = ref(storage, fileName);

      // ✅ Convert local file:// URI → Blob
      const response = await fetch(fileUri);
      const blob = await response.blob();
      console.log("📦 Blob created, size:", blob.size);

      // ✅ Upload blob
      const snapshot = await uploadBytesResumable(storageRef, blob, {
        contentType: "image/jpeg",
      });

      console.log("✅ Upload complete!");
      const downloadURL = await getDownloadURL(snapshot.ref);
      console.log("🌐 Download URL:", downloadURL);

      return downloadURL;
    } catch (err) {
      console.log("❌ Upload error:", err);
      throw err;
    }
  }

  const handleSubmit = async () => {
    setIsConfirmModalVisible(false);

    if (loading) return;
    setLoading(true);
    try {
      let updatedPostIncidentForm = { ...postIncidentForm };
      if (postIncidentForm.evidence !== "") {
        const evidencePicture = await uploadToFirebase(
          postIncidentForm.evidence
        );
        delete postIncidentForm.evidence;
        updatedPostIncidentForm = {
          ...postIncidentForm,
          evidence: evidencePicture,
        };
      }

      await api.put(`/postincident/${selectedID}`, {
        postIncidentForm: updatedPostIncidentForm,
      });
      setIsSuccess(true);
      setAlertMessage("The report has been successfully resolved.");
      setIsAlertModalVisible(true);
    } catch (error) {
      console.log("Error in submitting a post incident report", error);
    } finally {
      setLoading(false);
    }
  };
  const handleCloseAlertModal = () => {
    setIsAlertModalVisible(false);
    navigation.navigate("SOSRespondedDetails", { selectedID });
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        backgroundColor: "#BC0F0F",
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
              backgroundColor: "#BC0F0F",
              gap: 10,
            },
          ]}
        >
          <AntDesign
            onPress={() =>
              navigation.navigate("SOSReportDetails", { selectedID })
            }
            name="arrowleft"
            style={[MyStyles.backArrow, { color: "white" }]}
          />

          <Text
            style={[MyStyles.header, { fontFamily: "REMBold", color: "white" }]}
          >
            Post Incident Report
          </Text>

          <Text
            style={[MyStyles.formMessage, { color: "white", opacity: 0.7 }]}
          >
            Please fill out the required information to submit a post incident
            report.
          </Text>

          <View style={{ marginVertical: 30, gap: 10 }}>
            <View>
              <Text style={[MyStyles.inputLabel, { color: "white" }]}>
                Actions Taken on Scene<Text style={{ color: "white" }}>*</Text>
              </Text>
              <TextInput
                placeholder="Describe any actions you or your team took upon arrival."
                style={[
                  MyStyles.input,
                  { height: 200, textAlignVertical: "top" },
                ]}
                value={postIncidentForm.postreportdetails}
                type="text"
                multiline={true}
                numberOfLines={4}
                maxLength={3000}
                autoCapitalize="sentences"
                onChangeText={(text) => {
                  handleInputChange("postreportdetails", text);
                }}
              />

              <View
                style={[
                  MyStyles.errorDetailsWrapper,
                  { alignSelf: "flex-end" },
                ]}
              >
                <Text
                  style={[
                    MyStyles.detailsLength,
                    { color: "white", opacity: 0.7 },
                  ]}
                >
                  {postIncidentForm.postreportdetails.length}/1000
                </Text>
              </View>
            </View>

            {/* Evidence */}
            <View>
              <Text style={[MyStyles.inputLabel, { color: "white" }]}>
                Evidence{" "}
                <Text style={[MyStyles.inputLabel, { color: "white" }]}>
                  (if available)
                </Text>
              </Text>
              <View style={[MyStyles.uploadBox, { backgroundColor: "white" }]}>
                <View style={MyStyles.previewContainer}>
                  {isEvidenceProcessing ? (
                    <ActivityIndicator size="small" color="#0000ff" />
                  ) : postIncidentForm.evidence ? (
                    <Image
                      source={{ uri: postIncidentForm.evidence }}
                      style={MyStyles.image}
                    />
                  ) : (
                    <View style={MyStyles.placeholder}>
                      <Text style={[MyStyles.placeholderText]}>
                        Attach Picture
                      </Text>
                    </View>
                  )}
                </View>

                <View style={MyStyles.personalInfobuttons}>
                  <TouchableOpacity
                    onPress={toggleEvidenceCamera}
                    style={[
                      MyStyles.personalInfoButton,
                      {
                        borderWidth: 3,
                        borderColor: "#BC0F0F",
                        backgroundColor: "white",
                      },
                    ]}
                  >
                    <Entypo name="camera" size={20} color="#BC0F0F" />
                    <Text
                      style={{
                        fontFamily: "REMSemiBold",
                        color: "#BC0F0F",
                        fontSize: RFPercentage(1.8),
                      }}
                    >
                      Capture
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={pickEvidenceImage}
                    style={[
                      MyStyles.personalInfoButton,
                      {
                        borderWidth: 3,
                        borderColor: "#BC0F0F",
                        backgroundColor: "white",
                      },
                    ]}
                  >
                    <Feather name="upload" size={20} color="#BC0F0F" />
                    <Text
                      style={{
                        fontFamily: "REMSemiBold",
                        color: "#BC0F0F",
                        fontSize: RFPercentage(1.8),
                      }}
                    >
                      Upload
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={[
              MyStyles.button,
              {
                backgroundColor: "white",
              },
            ]}
            onPress={handleConfirm}
            disabled={loading}
          >
            <Text style={[MyStyles.buttonText, { color: "#BC0F0F" }]}>
              {loading ? "Submitting..." : "Submit"}
            </Text>
          </TouchableOpacity>

          <AlertModal
            isVisible={isConfirmModalVisible}
            isConfirmationModal={true}
            title="Submit Post Incident Report?"
            message="Are you sure you want to submit a post incident report?"
            onClose={() => setIsConfirmModalVisible(false)}
            onConfirm={handleSubmit}
          />
        </ScrollView>
        <AlertModal
          isVisible={isAlertModalVisible}
          message={alertMessage}
          isSuccess={isSuccess}
          onConfirm={handleCloseAlertModal}
          onClose={() => setIsAlertModalVisible(false)}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default PostIncident;
