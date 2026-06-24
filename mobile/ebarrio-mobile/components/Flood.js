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

const Flood = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const floodImg = require("../assets/disasters/flood-light.png");

  const tipsData = [
    {
      phase: "Before",
      steps: [
        "Understand Flood Risks\nLearn about the types of flooding that can occur in your area and the local emergency contacts to reach out to for help.",
        "Practice Your Safety Plan\nIdentify safe evacuation routes and practice them with your family. Establish a meeting point in case you get separated.",
        "Prepare an Emergency Kit\nInclude non-perishable foods, medicines, a first aid kit, flashlight, batteries, and water for several days.",
        "Teach Children to Swim",
        "Secure Important Documents\nStore them in waterproof containers.",
      ],
    },
    {
      phase: "During",
      steps: [
        "Stay Informed\nMonitor weather updates and follow instructions from local authorities.",
        "Avoid Floodwaters\nDo not walk, swim, or drive through floodwaters.",
        "Move to Higher Ground\nIf evacuation is not possible, move to the highest level of your home.",
        "Keep Children Safe\nEnsure they stay away from floodwaters.",
      ],
    },
    {
      phase: "After",
      steps: [
        "Wait for Official Clearance\nReturn home only when authorities declare it safe.",
        "Protect Your Health\nAvoid contact with floodwaters, which may carry diseases. Wash hands regularly and bathe children if exposed.",
        "Ensure Food and Water Safety\nBoil all water for at least three minutes before drinking or cooking. Discard food that has come into contact with floodwater.",
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
            <Image source={floodImg} style={MyStyles.disasterSafetyImg} />
          </View>

          <Text
            style={[MyStyles.header, { textAlign: "center", color: "#fff" }]}
          >
            FLOOD
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

export default Flood;
