import {
  StyleSheet,
  Text,
  View,
  Alert,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { MyStyles } from "./stylesheet/MyStyles";
import { useContext, useState, useEffect } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import { AuthContext } from "../context/AuthContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import LottieView from "lottie-react-native";

const SuccessfulPage2 = () => {
  const route = useRoute();
  const { service } = route.params;
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  return (
    <SafeAreaView
      style={{
        flex: 1,
        paddingTop: insets.top,
        backgroundColor: "#F0F4F7",
        justifyContent: "center", // Center vertically
        alignItems: "center", // Center horizontally
      }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <ScrollView
          contentContainerStyle={[
            MyStyles.scrollContainer,
            {
              justifyContent: "center",
              alignItems: "center",
              gap: 10,
              padding: 50,
            },
          ]}
        >
          <LottieView
            source={require("../assets/successful.json")}
            autoPlay
            loop
            style={{ width: "100%", height: 200 }}
          />

          {service === "ResidentForm" && (
            <View style={{ alignItems: "center" }}>
              <Text style={[MyStyles.header, { textAlign: "center" }]}>
                Successful!
              </Text>
              <Text style={MyStyles.serviceDesc}>
                Your resident profile request has been submitted to the
                barangay. You will receive a confirmation message via SMS within
                3 business days.
              </Text>
            </View>
          )}

          {service === "ResidentForm" && (
            <>
              <TouchableOpacity
                style={[MyStyles.button, { marginTop: 15 }]}
                onPress={() => navigation.navigate("Login")}
              >
                <Text style={MyStyles.buttonText}>OK</Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SuccessfulPage2;
