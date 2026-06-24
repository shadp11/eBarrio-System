import {
  Text,
  View,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from "react-native";
import { MyStyles } from "./stylesheet/MyStyles";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import AppLogo from "..//assets/applogo-darkbg.png";

const TermsConditions = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

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
              <View style={{ flexDirection: "row", alignSelf: "flex-start" }}>
                <AntDesign
                  onPress={() => navigation.navigate("Signup")}
                  name="arrowleft"
                  style={[MyStyles.backArrow]}
                />
                <Text style={[MyStyles.header, { alignSelf: "flex-start" }]}>
                  Terms and Conditions
                </Text>
              </View>

              <ScrollView
                style={{ width: "100%", marginBottom: 40 }}
                contentContainerStyle={{
                  alignItems: "center",
                  marginTop: 20,
                  gap: 10,
                  paddingBottom: 20,
                }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                <View>
                  <Text style={MyStyles.termsTitle}>1. Eligibility</Text>
                  <Text style={MyStyles.termsDesc}>
                    To use the services provided, you must be a resident of the
                    Barangay or have permission to access the App. By using the
                    App, you confirm that you are at least 18 years old or have
                    parental consent.
                  </Text>
                </View>

                <View>
                  <Text style={MyStyles.termsTitle}>
                    2. Account Registration
                  </Text>
                  <Text style={MyStyles.termsDesc}>
                    To access certain features of the app, you will need to
                    register an account. During registration, you will be asked
                    to provide personal information such as your name, username,
                    email address, mobile number, and password. By submitting
                    this information, you agree to provide accurate and
                    up-to-date details. It is your responsibility to keep your
                    account and password secure and confidential.
                  </Text>
                </View>

                <View>
                  <Text style={MyStyles.termsTitle}>3. Session Duration</Text>
                  <Text style={MyStyles.termsDesc}>
                    Using our services means that your session will remain
                    active for a period of 30 days from the moment you log in.
                    Your session will continue without interruption until you
                    manually log out. You are responsible for logging out when
                    you are no longer using the application to ensure the
                    security of your account. After 30 days, your session will
                    automatically expire requiring you to login again to
                    continue using our services.
                  </Text>
                </View>

                <View>
                  <Text style={MyStyles.termsTitle}>4. User Conduct</Text>
                  <Text style={MyStyles.termsDesc}>
                    You agree not to use the App for any unlawful or prohibited
                    purpose, including, but not limited to: {"\n"} - Posting or
                    transmitting any unlawful, harmful, abusive, or
                    inappropriate content. {"\n"} - Engaging in fraudulent
                    activities. {"\n"} - Misusing the App’s features, including
                    reporting false emergency situations or tampering with
                    disaster response information. {"\n"} - Violating any local,
                    state, or national laws.
                  </Text>
                </View>

                <View>
                  <Text style={MyStyles.termsTitle}>5. Notifications</Text>
                  <Text style={MyStyles.termsDesc}>
                    By enabling notifications for this application, you consent
                    to receiving important updates, alerts, and
                    emergency-related communications. These notifications may
                    include, but are not limited to: {"\n"} - Barangay
                    announcements {"\n"} - Request Status Updates
                  </Text>
                </View>

                <View>
                  <Text style={MyStyles.termsTitle}>
                    6. Disaster Response Features
                  </Text>
                  <Text style={MyStyles.termsDesc}>
                    The App allows residents to access emergency protocols,
                    report emergencies, and receive updates. By using these
                    features, you agree to: {"\n"} - Provide accurate and
                    truthful information when reporting incidents or
                    emergencies. {"\n"} - Acknowledge that any misuse of
                    disaster response features could lead to delays or errors in
                    the delivery of essential services.
                  </Text>
                </View>

                <View>
                  <Text style={MyStyles.termsTitle}>
                    7. Intellectual Property
                  </Text>
                  <Text style={MyStyles.termsDesc}>
                    The App, including its design, visuals, logos, and
                    information, is the eBarrio's intellectual property and is
                    protected by applicable laws. You are not permitted to
                    reproduce, distribute, modify, or create copied versions of
                    the App without the Barangay's prior written agreement.
                  </Text>
                </View>

                <View>
                  <Text style={MyStyles.termsTitle}>
                    8. Third-Party Services
                  </Text>
                  <Text style={MyStyles.termsDesc}>
                    The App may contain links to third-party websites or
                    services that are not within our control. We are not liable
                    for the content, privacy policies, or services offered by
                    these third parties. We recommend reviewing the terms and
                    conditions for any third-party services you use.
                  </Text>
                </View>

                <View>
                  <Text style={MyStyles.termsTitle}>
                    9. Disclaimer of Liability
                  </Text>
                  <Text style={MyStyles.termsDesc}>
                    While the App aims to provide accurate and up-to-date
                    information, we offer no guarantees about the data's
                    accuracy, reliability, or completeness. You acknowledge that
                    you are using the App at your own risk. The Barangay and its
                    administrators will not be held liable for any damages or
                    losses resulting from your use of the App or reliance on the
                    information included within.
                  </Text>
                </View>

                <View>
                  <Text style={MyStyles.termsTitle}>10. App Availability</Text>
                  <Text style={MyStyles.termsDesc}>
                    The App may be offline temporarily due to maintenance or
                    technical issues. The Barangay is not responsible for
                    service disruptions, and it will take reasonable steps to
                    restore service as quickly as possible.
                  </Text>
                </View>

                <View>
                  <Text style={MyStyles.termsTitle}>
                    11. Updates and Modifications
                  </Text>
                  <Text style={MyStyles.termsDesc}>
                    The Barangay reserves the right to modify, update, or
                    discontinue the App at any time without prior notice. Any
                    changes to these terms will be posted within the App, and
                    your continued use of the App indicates your acceptance of
                    the new terms.
                  </Text>
                </View>

                <View>
                  <Text style={MyStyles.termsTitle}>12. Governing Law</Text>
                  <Text style={MyStyles.termsDesc}>
                    These terms and conditions will be regulated and enforced in
                    line with the laws of Barangay Aniban 2 and the Philippines.
                    Any issues arising from the use of the App will be resolved
                    exclusively by the courts of Barangay Aniban 2.
                  </Text>
                </View>

                <View>
                  <Text style={MyStyles.termsTitle}>13. Termination</Text>
                  <Text style={MyStyles.termsDesc}>
                    If you violate these Terms of Service or engage in
                    misconduct, we may suspend or terminate your access to the
                    App. Upon termination, all rights granted to you under these
                    terms will be terminated, and you must stop using the App.
                  </Text>
                </View>

                <View>
                  <Text style={MyStyles.termsTitle}>
                    14. Contact Information
                  </Text>
                  <Text style={MyStyles.termsDesc}>
                    For questions or concerns regarding these terms and
                    conditions, or if you need support related to the App,
                    please contact us at:{"\n"}
                    {" - "}Email: brgyaniban2bacoorcity@gmail.com{"\n"}
                    {" - "}Telephone: 476-9397
                  </Text>
                </View>
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default TermsConditions;
