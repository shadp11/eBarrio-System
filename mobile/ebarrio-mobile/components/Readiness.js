import {
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Image,
  ScrollView,
} from "react-native";
import { MyStyles } from "./stylesheet/MyStyles";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState, useEffect } from "react";

//ICONS & IMAGES
import { AntDesign, MaterialIcons } from "@expo/vector-icons";

const Readiness = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [isEmergencyClicked, setEmergencyClicked] = useState(false);
  const route = useRoute();
  const fromOffline = route.params?.fromOffline || false;

  const readinessData = [
    {
      title: "QUICK SAFETY",
      subtitle: "Easy access to essential safety information",
      image: require("../assets/disasters/quick-tips.png"),
      route: "QuickTips",
    },
    {
      title: "DISASTER SAFETY",
      subtitle: "Learn practical tips to stay safe during natural disasters",
      image: require("../assets/disasters/disaster.png"),
      route: "SafetyTips",
    },
    {
      title: "HAZARD MAPS",
      subtitle: "View areas at risk for natural hazards",
      image: require("../assets/disasters/hazard.png"),
      route: "HazardMap",
    },
    {
      title: "EVACUATION MAP",
      subtitle: "View the route to the nearest evacuation map",
      image: require("../assets/disasters/evacuation.png"),
      route: "EvacuationMap",
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
              gap: 10,
              backgroundColor: "#BC0F0F",
            },
          ]}
        >
          <AntDesign
            onPress={() => {
              if (fromOffline) {
                navigation.navigate("Offline");
              } else {
                navigation.navigate("BottomTabs");
              }
            }}
            name="arrowleft"
            style={[MyStyles.backArrow, { color: "#fff" }]}
          />

          <Text
            style={[MyStyles.servicesHeader, { marginTop: 0, color: "#fff" }]}
          >
            Readiness
          </Text>

          <View style={MyStyles.readinessColWrapper}>
            {readinessData.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={MyStyles.readinessCard}
                onPress={
                  item.route ? () => navigation.navigate(item.route) : null
                }
              >
                <Image source={item.image} style={MyStyles.readinessImg} />
                <View style={MyStyles.readinessTextContainer}>
                  <Text style={MyStyles.readinessTitle}>{item.title}</Text>
                  <Text style={MyStyles.readinessSubTitle}>
                    {item.subtitle}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Readiness;
