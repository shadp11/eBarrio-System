import {
  Text,
  View,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import { MyStyles } from "./stylesheet/MyStyles";

const Fire = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const fireImg = require("../assets/disasters/fire-light.png");

  const tipsData = [
    {
      phase: "Before",
      steps: [
        "Install Smoke Alarms\nPlace smoke detectors on every level of your home and test them monthly.",
        "Fire Extinguishers\nKeep them accessible and ensure everyone knows how to use them.",
        "Escape Plan\nDevelop and practice a fire escape plan with all household members.",
        "Avoid Overloading Outlets\nDo not overload electrical outlets to prevent fires.",
      ],
    },
    {
      phase: "During",
      steps: [
        "Evacuate Immediately\nLeave the building as quickly as possible and do not stop to collect belongings.",
        "Stay Low\nIf there's smoke, crawl low under it to your exit.",
        "Do Not Re-enter\nOnce out, stay out and call emergency services.",
      ],
    },
    {
      phase: "After",
      steps: [
        "Wait for Clearance\nDo not re-enter until authorities declare it safe.",
        "Check for Injuries\nAdminister first aid if needed and seek medical attention for serious injuries.",
        "Check for Damage\nAssess the property for structural damage and hazards.",
        "Seek Support\nContact local disaster relief services for assistance.",
      ],
    },
  ];

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
              gap: 20,
              backgroundColor: "#BC0F0F",
            },
          ]}
        >
          <AntDesign
            onPress={() => navigation.navigate("SafetyTips")}
            name="arrowleft"
            style={[MyStyles.backArrow, { color: "#fff" }]}
          />

          <View style={{ alignItems: "center" }}>
            <Image source={fireImg} style={MyStyles.disasterSafetyImg} />
          </View>

          <Text
            style={[MyStyles.header, { textAlign: "center", color: "#fff" }]}
          >
            FIRE
          </Text>

          {tipsData.map((section, index) => (
            <View
              key={index}
              style={[MyStyles.shadow, MyStyles.disasterSafetyCard]}
            >
              <Text style={MyStyles.sectionPhase}>{section.phase}</Text>

              {section.steps.map((step, stepIndex) => (
                <View key={stepIndex} style={MyStyles.sectionStepsWrapper}>
                  <View style={MyStyles.steps}>
                    <Text style={MyStyles.stepsNo}>{stepIndex + 1}</Text>
                  </View>
                  <Text style={MyStyles.stepsDesc}>
                    <Text style={{ fontFamily: "QuicksandBold" }}>
                      {step.split("\n")[0]}
                    </Text>
                    {"\n" + step.split("\n")[1]}
                  </Text>
                </View>
              ))}
            </View>
          ))}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Fire;
