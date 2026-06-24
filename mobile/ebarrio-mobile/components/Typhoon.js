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

const Typhoon = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const typhoonImg = require("../assets/disasters/typhoon-light.png");

  const tipsData = [
    {
      phase: "Before",
      steps: [
        "Understand Typhoon Risks\nFamiliarize yourself with the likelihood of typhoons or severe thunderstorms in your community.",
        "Stay Informed\nMonitor weather forecasts and learn about local alert systems to receive timely warnings.",
        "Prepare an Emergency Kit\nInclude non-perishable food, water, medication, a first-aid kit, flashlights, batteries, and important documents.",
        "Secure Your Home\nReinforce your home, trim trees, and remove dead branches to reduce risks.",
        "Plan for Evacuation\nIdentify the safest shelter or evacuation center for all family members and prepare for possible evacuation.",
      ],
    },
    {
      phase: "During",
      steps: [
        "Stay Indoors\nRemain inside and away from windows.",
        "Monitor Updates\nListen to official announcements for instructions.",
        "Avoid Flooded Areas\nDo not go into areas prone to flooding or landslides.",
      ],
    },
    {
      phase: "After",
      steps: [
        "Wait for Official Clearance\nDo not go outside until authorities confirm it's safe.",
        "Check for Injuries\nProvide first aid if necessary and seek medical help for any serious injuries.",
        "Check for Hazards\nBe cautious of downed power lines and structural damages.",
        "Communicate\nInform family and friends of your safety.",
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
            { gap: 20, backgroundColor: "#BC0F0F" },
          ]}
        >
          <AntDesign
            onPress={() => navigation.navigate("SafetyTips")}
            name="arrowleft"
            style={[MyStyles.backArrow, { color: "#fff" }]}
          />

          <View style={{ alignItems: "center" }}>
            <Image source={typhoonImg} style={MyStyles.disasterSafetyImg} />
          </View>

          <Text
            style={[MyStyles.header, { textAlign: "center", color: "#fff" }]}
          >
            TYPHOON
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

export default Typhoon;
