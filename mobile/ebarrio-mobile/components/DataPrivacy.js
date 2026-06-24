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
import { AntDesign } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import AppLogo from "../assets/applogo-darkbg.png";

const DataPrivacy = () => {
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
                  Data Privacy
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
                {/* Data Privacy Policy */}
                <View>
                  <Text style={MyStyles.termsTitle}>1. Data Collection</Text>
                  <Text style={MyStyles.termsDesc}>
                    We collect personal information when you use the app,
                    including name, email, phone number, and location. This data
                    is used to provide services such as emergency response and
                    communication updates. We may also collect non-personal
                    information, such as device type, operating system, and
                    usage data.
                  </Text>
                </View>

                <View>
                  <Text style={MyStyles.termsTitle}>2. Data Use</Text>
                  <Text style={MyStyles.termsDesc}>
                    Your personal data will be used only for the purposes
                    outlined in our privacy policy. We will not share, sell, or
                    rent your personal information to third parties without your
                    consent, except as required by law.
                  </Text>
                </View>

                <View>
                  <Text style={MyStyles.termsTitle}>3. Data Storage</Text>
                  <Text style={MyStyles.termsDesc}>
                    We take all reasonable precautions to store your data
                    securely and protect it from unauthorized access or misuse.
                    However, no method of transmission over the Internet or
                    electronic storage is 100% secure, and we cannot guarantee
                    the absolute security of your data.
                  </Text>
                </View>

                <View>
                  <Text style={MyStyles.termsTitle}>4. Data Sharing</Text>
                  <Text style={MyStyles.termsDesc}>
                    Your personal data may be shared with authorized personnel
                    or service providers necessary to fulfill the services
                    provided by the App. We will not share or disclose your data
                    except in the case of an emergency or as required by law.
                  </Text>
                </View>

                <View>
                  <Text style={MyStyles.termsTitle}>5. Your Rights</Text>
                  <Text style={MyStyles.termsDesc}>
                    You have the right to access, update, or delete your
                    personal data. If you would like to exercise these rights,
                    please contact us at the email provided below.
                  </Text>
                </View>

                <View>
                  <Text style={MyStyles.termsTitle}>6. Data Retention</Text>
                  <Text style={MyStyles.termsDesc}>
                    We will retain your personal data only for as long as
                    necessary to provide the services or as required by law. If
                    you choose to delete your account, your data will be removed
                    from our systems within a reasonable timeframe.
                  </Text>
                </View>

                <View>
                  <Text style={MyStyles.termsTitle}>7. Location Access</Text>
                  <Text style={MyStyles.termsDesc}>
                    By using this application, you grant permission for the app
                    to access the location of your device in the event of an SOS
                    emergency. Your location is collected and used in accordance
                    with our Privacy Policy. You can revoke location access at
                    any time by changing the permissions in your device
                    settings.
                  </Text>
                </View>

                <View>
                  <Text style={MyStyles.termsTitle}>
                    8. Contact Information
                  </Text>
                  <Text style={MyStyles.termsDesc}>
                    If you have any questions or concerns about our privacy
                    practices, please contact us at:{"\n"} - Email:
                    brgyaniban2bacoorcity@gmail.com{"\n"} - Telephone: 476-9397
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

export default DataPrivacy;
