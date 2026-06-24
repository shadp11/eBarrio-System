import {
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { MyStyles } from "./stylesheet/MyStyles";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import LottieView from "lottie-react-native";

const SuccessfulPage = () => {
  const route = useRoute();
  const { service } = route.params;
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  return (
    <SafeAreaView
      style={{
        flex: 1,
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        backgroundColor: "#fff",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <ScrollView
          contentContainerStyle={[
            MyStyles.scrollContainer,
            MyStyles.successScrollWrapper,
          ]}
        >
          <LottieView
            source={require("../assets/successful.json")}
            autoPlay
            loop
            style={MyStyles.successLottie}
          />

          {service === "Document" && (
            <View style={{ alignItems: "center" }}>
              <Text style={[MyStyles.header, { textAlign: "center" }]}>
                Successful!
              </Text>
              <Text style={[MyStyles.serviceDesc, { paddingHorizontal: 25 }]}>
                Your document request has been received by the barangay. You
                will be notified once the request is ready for pickup. For the
                meantime, you may view the status of your request.
              </Text>
            </View>
          )}

          {service === "Blotter" && (
            <View style={{ alignItems: "center" }}>
              <Text style={[MyStyles.header, { textAlign: "center" }]}>
                Successful!
              </Text>
              <Text style={[MyStyles.serviceDesc, { paddingHorizontal: 25 }]}>
                Your blotter report has been received by the barangay. You will
                be notified once your report has an update. For the meantime,
                you may view the status of your report.
              </Text>
            </View>
          )}

          {service === "Reservation" && (
            <View style={{ alignItems: "center" }}>
              <Text style={[MyStyles.header, { textAlign: "center" }]}>
                Successful!
              </Text>
              <Text style={[MyStyles.serviceDesc, { paddingHorizontal: 25 }]}>
                Your court reservation request has been received by the
                barangay. You will be notified once your reservation is
                accepted. For the meantime, you may view the status of your
                request.
              </Text>
            </View>
          )}

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

          {(service === "Reservation" ||
            service === "Document" ||
            service === "Blotter") && (
            <View
              style={{
                width: "100%",
                alignItems: "center",
                justifyContent: "flex-end",
                flex: 1,
                flexDirection: "column",
                gap: 15,
              }}
            >
              <TouchableOpacity
                style={[MyStyles.button]}
                onPress={() => navigation.navigate("Status")}
              >
                <Text style={MyStyles.buttonText}>View Status</Text>
              </TouchableOpacity>

              <Text
                style={[MyStyles.buttonText, { color: "#0E94D3" }]}
                onPress={() => navigation.navigate("BottomTabs")}
              >
                Back to Home
              </Text>
            </View>
          )}

          {service === "ResidentForm" && (
            <>
              <TouchableOpacity
                style={[MyStyles.button, { marginTop: 15 }]}
                onPress={() => navigation.navigate("Login")}
              >
                <Text style={MyStyles.buttonText}>CONTINUE</Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SuccessfulPage;
